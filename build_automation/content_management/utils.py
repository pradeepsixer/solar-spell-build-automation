import datetime
import hashlib
import os
import shutil
import tarfile
import tempfile
import zipfile
import time

from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from django.template.loader import render_to_string

from content_management.models import Build, Content, Directory, DirectoryLayout
from content_management.storage import CustomFileStorage


class HashUtil:
    """
    Hash Computation Utility
    """

    @staticmethod
    def calc_sha256(input_file):
        """
        Calculate the SHA-256 checksum for the given file object.
        :param input_file: Input file for which the SHA-256 should be calculated.
        """
        sha256_ctxt = hashlib.sha256()
        bytes_data = input_file.read(4096)
        while bytes_data != b"":
            sha256_ctxt.update(bytes_data)
            bytes_data = input_file.read(4096)
        input_file.seek(0)
        return sha256_ctxt.hexdigest()


class LibraryVersionBuildUtil:
    """
    Start the build process on the
    """

    ROOT_DIR_NAV_PREFIX = "../.."
    ALL_FILES_PREFIX = "all_files"
    MAX_MENU_LEVELS = 2

    def get_latest_build(self):
        builds = Build.objects.all()
        if builds.count() > 0:
            return builds.last()
        return None

    def build_library_version(self, dir_layout_id):
        directory_layout = DirectoryLayout.objects.get(id=dir_layout_id)
        tarfile_name = self.__get_date_suffixed_file_name(directory_layout.name)
        tarfile_path = self.__get_tarfile_path(tarfile_name)
        self.__update_existing_build(directory_layout, None, Build.TaskState.RUNNING, None, True)
        print("I am here")
        # Context for rendering the template
        template_ctxt = {
            'dirlayout_banner': os.path.basename(directory_layout.banner_file.path),
        }
        folder_list = []
        menu_list = []


        top_dirs = Directory.objects.filter(dir_layout=directory_layout, parent=None)  # Get the top directories
        try:
            with tarfile.open(tarfile_path, "w:gz") as build_tar:
                raise Exception("Expection raise")

                # Copy the directory layout's banner image.
                banner_path = os.path.join("img", os.path.basename(directory_layout.banner_file.name))
                build_tar.add(directory_layout.banner_file.path, arcname=banner_path)

                for each_top_dir in top_dirs:
                    # Directory's Banner Image

                    current_menu = {
                        'name': each_top_dir.name,
                        'submenu_list': []
                    }
                    self.__build_files_list(
                        each_top_dir, build_tar, '', self.ROOT_DIR_NAV_PREFIX,
                        folder_list, 1, menu_list
                    )

                template_ctxt['folder_list'] = folder_list
                template_ctxt['menu_list'] = menu_list

                template_rendered_files_map = [
                    ('spell_builds/index.html', 'index.html'),
                    ('spell_builds/content/listr-template.html', 'content/listr-template.php'),
                    ('spell_builds/aboutus.html', 'aboutus.html')
                ]
                for (template_file, rendered_file_in_tarfile) in template_rendered_files_map:
                    rendered_output = render_to_string(template_file, context=template_ctxt)

                    out_file = tempfile.NamedTemporaryFile(delete=False)
                    out_file.write(rendered_output.encode())
                    out_file.close()
                    build_tar.add(out_file.name, arcname=rendered_file_in_tarfile)
                    os.remove(out_file.name)

                # Add the assets to the root of the directory.
                build_tar.add(settings.BUILD_ASSETS_DIR, arcname='')

                # Need to comment this piece of code for the above inelegant one, because of stupid windows
                # not allowing to open the file for a second time.
                # with tempfile.NamedTemporaryFile() as out_file:
                #     out_file.write(rendered_output.encode())
                #     build_tar.add(out_file.name, arcname='index.html')

                self.__update_existing_build(
                    directory_layout, tarfile_name, Build.TaskState.FINISHED, Build.BuildCompletionState.SUCCESS
                )
        except Exception as e:
            print('Exception occurred')
            print(e)  # TODO: Replace this with logger
            if os.path.exists(tarfile_path):
                os.remove(tarfile_path)
            self.__update_existing_build(
                directory_layout, tarfile_name, Build.TaskState.FINISHED, Build.BuildCompletionState.FAILURE
            )

    def __get_date_suffixed_file_name(self, layout_name):
        current_time = datetime.datetime.now()
        date_suffix = current_time.strftime('%Y_%m_%d %H_%M_%S')
        return "{} {}.tar.gz".format(layout_name, date_suffix)

    def __get_tarfile_path(self, tarfile_name):
        return os.path.join(os.path.abspath(settings.BUILDS_ROOT), tarfile_name)

    def __update_existing_build(self, dir_layout, file_name, task_state, completion_state, remove_file=False):
        latest_build = self.get_latest_build()
        if latest_build is None:
            latest_build = Build()

        if task_state == Build.TaskState.RUNNING:
            latest_build.start_time = timezone.now()

        latest_build.task_state = task_state
        latest_build.completion_state = completion_state

        # Remove the existing build file.
        if remove_file and latest_build.build_file is not None:
            tarfile_path = self.__get_tarfile_path(latest_build.build_file)
            if os.path.exists(tarfile_path):
                os.remove(tarfile_path)

        latest_build.build_file = file_name
        latest_build.dir_layout = dir_layout

        if task_state == Build.TaskState.FINISHED:
            latest_build.end_time = timezone.now()

        latest_build.save()

    def __build_files_list(self, directory, build_file, dir_path, root_dir, folder_list, menu_level, menu_list=None):
        """
        Walk through the directory structure, and build the build file.
        :param directory: Directory to walk through.
        :param build_file: The final build file - a tarball
        :param dir_path: The path of the directory within the build_file.
        :root_dir: The path to the root directory within the tarball. Used for symlinks.
        """
        dir_path = os.path.join(dir_path, directory.name)
        root_dir = os.path.join(root_dir, "..")

        if (
            directory.banner_file is not None and len(directory.banner_file.name) > 0 and
            os.path.exists(directory.banner_file.path)
        ):
            banner_path = os.path.join("img", os.path.basename(directory.banner_file.name))
            build_file.add(directory.banner_file.path, arcname=banner_path)

            folder_list.append(
                {
                    'name': directory.name,
                    'banner_file': os.path.basename(directory.banner_file.path),
                    'path': dir_path,
                    'files_at_root': False,
                }
            )

        current_menu = None
        if menu_level <= self.MAX_MENU_LEVELS:
            current_menu = {
                'name': directory.name,
                'path': dir_path,
                'submenu_list': [],
                'files_at_root': False,
            }
            menu_list.append(current_menu)

        for subdir in directory.subdirectories.all():
            if current_menu is None:
                self.__build_files_list(subdir, build_file, dir_path, root_dir, folder_list, menu_level+1, None)
            else:
                self.__build_files_list(
                    subdir, build_file, dir_path, root_dir, folder_list, menu_level+1, current_menu['submenu_list']
                )

        individual_files = directory.individual_files.all()
        metadata_filter_criteria = self.__get_metadata_filter_criteria(directory)

        if (
            len(individual_files) > 0 or metadata_filter_criteria is not None
        ):
            # There is some filtering conditioning specified for the directory. Include the matching files:
            individual_files_filter = None
            if len(individual_files) > 0:
                individual_files_filter = Q(id__in=[each_file.id for each_file in individual_files])

            entire_filter_criteria = None
            if individual_files_filter is None:
                entire_filter_criteria = metadata_filter_criteria
            elif metadata_filter_criteria is None:
                entire_filter_criteria = individual_files_filter
            else:
                entire_filter_criteria = individual_files_filter | metadata_filter_criteria
            matching_contents = Content.objects.filter(entire_filter_criteria)

            for each_content in matching_contents:
                (is_zip_file, zip_file_name) = self.__copy_content_file(build_file, each_content, dir_path, root_dir)
                if is_zip_file:
                    folder_list[-1]['path'] = zip_file_name
                    folder_list[-1]['files_at_root'] = True
                    if current_menu is not None:
                        current_menu['path'] = zip_file_name
                        current_menu['files_at_root'] = True

    def __copy_content_file(self, build_file, content, dir_path, root_dir):
        # The name of the file as is in the filesystem.
        actual_file_name = content.content_file.name

        # The original file name without the duplication.
        original_file_name = content.original_file_name

        if original_file_name is None:
            cfs = CustomFileStorage()
            original_file_name = cfs.get_original_file_name(actual_file_name)

        (file_name_only, extension) = os.path.splitext(original_file_name)
        is_zip_file = (extension == ".zip")

        if extension == ".zip":
            # Extract the file to a local folder and then copy it.
            if os.path.exists(settings.TEMP_EXTRACTION_DIR):
                shutil.rmtree(settings.TEMP_EXTRACTION_DIR)
            os.makedirs(settings.TEMP_EXTRACTION_DIR)
            with zipfile.ZipFile(content.content_file.path) as content_zip:
                content_zip.extractall(path=settings.TEMP_EXTRACTION_DIR)
            build_file.add(
                settings.TEMP_EXTRACTION_DIR,
                arcname=file_name_only
            )
            shutil.rmtree(settings.TEMP_EXTRACTION_DIR)
        else:
            link_path = os.path.join(settings.CONTENT_DIRECTORY, dir_path, original_file_name)
            dest_path = os.path.join(self.ALL_FILES_PREFIX, os.path.basename(actual_file_name))

            build_file.add(content.content_file.path,arcname=dest_path)
            link_to_file = tarfile.TarInfo(link_path)
            link_to_file.type = tarfile.SYMTYPE
            link_to_file.linkname = os.path.join(root_dir, dest_path)
            build_file.addfile(link_to_file)

        return (is_zip_file, file_name_only)

    def __get_metadata_filter_criteria(self, directory):
        creators = directory.creators.all()
        coverages = directory.coverages.all()
        subjects = directory.subjects.all()
        keywords = directory.keywords.all()
        workareas = directory.workareas.all()
        languages = directory.languages.all()
        catalogers = directory.catalogers.all()

        metadata_filter_criteria = None
        metadata_filter_criteria = self.__add_metadata_to_filter(
            creators,
            'creators',
            metadata_filter_criteria,
            directory.creators_need_all,
        )

        metadata_filter_criteria = self.__add_metadata_to_filter(
            coverages,
            'coverage',
            metadata_filter_criteria,
            directory.coverages_need_all,
        )
        metadata_filter_criteria = self.__add_metadata_to_filter(
            subjects,
            'subjects',
            metadata_filter_criteria,
            directory.subjects_need_all,
        )
        metadata_filter_criteria = self.__add_metadata_to_filter(
            keywords,
            'keywords',
            metadata_filter_criteria,
            directory.keywords_need_all,
        )
        metadata_filter_criteria = self.__add_metadata_to_filter(
            workareas,
            'workareas',
            metadata_filter_criteria,
            directory.workareas_need_all,
        )
        metadata_filter_criteria = self.__add_metadata_to_filter(
            languages,
            'language',
            metadata_filter_criteria,
            directory.languages_need_all,
        )
        metadata_filter_criteria = self.__add_metadata_to_filter(
            catalogers,
            'cataloger',
            metadata_filter_criteria,
            directory.catalogers_need_all,
        )
        return metadata_filter_criteria

    def __add_metadata_to_filter(self, current_metadata, metadata_type, entire_metadata_filter, need_all):
        if len(current_metadata) > 0:
            kwargs = {
                metadata_type: current_metadata[0]
            }
            current_metadata_filter = Q(**kwargs)
            for i in range(1, len(current_metadata)):
                kwargs = {
                    metadata_type: current_metadata[i]
                }
                if need_all:
                    current_metadata_filter = current_metadata_filter & Q(**kwargs)
                else:
                    current_metadata_filter = current_metadata_filter | Q(**kwargs)
            if entire_metadata_filter is None:
                entire_metadata_filter = current_metadata_filter
            else:
                entire_metadata_filter = entire_metadata_filter & (current_metadata_filter)
        return entire_metadata_filter
