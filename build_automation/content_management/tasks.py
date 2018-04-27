from __future__ import absolute_import, unicode_literals

import os

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'build_automation.settings')

app = Celery('build_automation')

app.config_from_object('django.conf:settings', namespace='CELERY')


@app.task(bind=True)
def start_dirlayout_build(self, directory_layout_id):
    from content_management.utils import LibraryVersionBuildUtil
    build_util = LibraryVersionBuildUtil()
    build_util.build_library_version(directory_layout_id)
    print('Done starting the build process')
