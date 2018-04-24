import datetime
import hashlib
import os
import tarfile

from django.conf import settings
from django.db.models import Q
from django.utils import timezone

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
    CONTENT_PREFIX = "content/_public"
    ALL_FILES_PREFIX = "all_files"

    def get_latest_build(self):
        builds = Build.objects.all()
        if builds.count() > 0:
            return builds.last()
        return None

    def build_library_version(self, dir_layout_id):
        directory_layout = DirectoryLayout.objects.get(id=dir_layout_id)
        tarfile_name = "{} {}.tar.gz".format(directory_layout.name, datetime.datetime.now())
        self.__update_existing_build(directory_layout, None, Build.TaskState.RUNNING, None)

        top_dirs = Directory.objects.filter(dir_layout=directory_layout, parent=None)  # Get the top directories
        try:
            with tarfile.open(
                os.path.join(settings.BASE_DIR, "build_automation", "builds", tarfile_name), "w:gz"
            ) as build_tar:

                # Copy the directory layout's banner image.
                banner_path = os.path.join("img", os.path.basename(directory_layout.banner_file.name))
                build_tar.add(directory_layout.banner_file.path, arcname=banner_path)

                for each_top_dir in top_dirs:
                    # Directory's Banner Image
                    banner_path = os.path.join("img", os.path.basename(each_top_dir.banner_file.name))
                    build_tar.add(each_top_dir.banner_file.path, arcname=banner_path)
                    self.__build_files_list(each_top_dir, build_tar, self.CONTENT_PREFIX, self.ROOT_DIR_NAV_PREFIX)
        except Exception as e:
            print(e)  # TODO: Replace this with logger

    def __update_existing_build(self, dir_layout, build_url, task_state, completion_state):
        latest_build = self.get_latest_build()
        if latest_build is None:
            latest_build = Build()
            latest_build.start_time = timezone.now()
        latest_build.task_state = task_state
        latest_build.completion_state = completion_state
        latest_build.build_url = build_url
        latest_build.dir_layout = dir_layout

        if task_state == Build.TaskState.FINISHED:
            latest_build.end_time = timezone.now()

        latest_build.save()

    def __build_files_list(self, directory, build_file, dir_path, root_dir):
        """
        Walk through the directory structure, and build the build file.
        :param directory: Directory to walk through.
        :param build_file: The final build file - a tarball
        :param dir_path: The path of the directory within the build_file.
        :root_dir: The path to the root directory within the tarball. Used for symlinks.
        """
        dir_path = os.path.join(dir_path, directory.name)
        root_dir = os.path.join(root_dir, "..")

        for subdir in directory.subdirectories.all():
            self.__build_files_list(subdir, build_file, dir_path, root_dir)

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
                self.__copy_content_file(build_file, each_content, dir_path, root_dir)

    def __copy_content_file(self, build_file, content, dir_path, root_dir):
        # The name of the file as is in the filesystem.
        actual_file_name = content.content_file.name

        # The original file name without the duplication.
        original_file_name = content.original_file_name

        if original_file_name is None:
            cfs = CustomFileStorage()
            original_file_name = cfs.get_original_file_name(actual_file_name)

        link_path = os.path.join(dir_path, original_file_name)
        dest_path = os.path.join(self.ALL_FILES_PREFIX, os.path.basename(actual_file_name))

        build_file.add(
            content.content_file.path,
            arcname=dest_path
        )
        link_to_file = tarfile.TarInfo(link_path)
        link_to_file.type = tarfile.SYMTYPE
        link_to_file.linkname = os.path.join(root_dir, dest_path)
        build_file.addfile(link_to_file)

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
