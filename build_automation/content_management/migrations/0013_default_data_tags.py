"""
    Purpose: To populate default values for all kinds of tags - Creators, Coverage (Spatial), Subjects, Keywords,
        Work Areas, Languages, and Cataloger.

    Author: Pradeep Kumar Rajasekaran
"""
from django.db import migrations

def persist_default_coverages(apps, schema_editor):
    COVERAGES = [
        {'name': 'American Samoa', 'description': 'American Samoa'},
        {'name': 'Chuuk', 'description': 'Chuuk'},
        {'name': 'Cook Islands', 'description': 'Cook Islands'},
        {'name': 'Federated States of Micronesia', 'description': 'Federated States of Micronesia'},
        {'name': 'Guam', 'description': 'Guam'},
        {'name': 'Kiribati', 'description': 'Kiribati'},
        {'name': 'Kosrae', 'description': 'Kosrae'},
        {'name': 'Marshall Islands', 'description': 'Marshall Islands'},
        {'name': 'Niue', 'description': 'Niue'},
        {'name': 'Northern Mariana Islands', 'description': 'Northern Mariana Islands'},
        {'name': 'Oceania', 'description': 'Oceania'},
        {'name': 'Pacific Islands', 'description': 'Pacific Islands'},
        {'name': 'Palau', 'description': 'Palau'},
        {'name': 'Pohnpei', 'description': 'Pohnpei'},
        {'name': 'Samoa', 'description': 'Samoa'},
        {'name': 'Solomon Islands', 'description': 'Solomon Islands'},
        {'name': 'Tonga', 'description': 'Tonga'},
        {'name': 'Tuvalu', 'description': 'Tuvalu'},
        {'name': 'Vanuatu', 'description': 'Vanuatu'},
        {'name': 'Yap', 'description': 'Yap'},
    ]
    Coverage = apps.get_model('content_management', 'Coverage')
    for each_coverage in COVERAGES:
        Coverage.objects.create(**each_coverage)

def persist_default_subjects(apps, schema_editor):
    SUBJECTS = [
        {'name': 'Addition', 'description': 'Addition'},
        {'name': 'Advanced Students', 'description': 'Advanced Students'},
        {'name': 'Agriculture', 'description': 'Agriculture'},
        {'name': 'Anatomy', 'description': 'Anatomy'},
        {'name': 'Arithmetic', 'description': 'Arithmetic'},
        {'name': 'Arts', 'description': 'Arts'},
        {'name': 'Basic Skills', 'description': 'Basic Skills'},
        {'name': 'Biology', 'description': 'Biology'},
        {'name': 'Chemistry', 'description': 'Chemistry'},
        {'name': 'Climate', 'description': 'Climate'},
        {'name': 'Conservation (Environment)', 'description': 'Conservation (Environment)'},
        {'name': 'Division', 'description': 'Division'},
        {'name': 'Early Reading', 'description': 'Early Reading'},
        {'name': 'Earth Science', 'description': 'Earth Science'},
        {'name': 'Economics', 'description': 'Economics'},
        {'name': 'Educational Resources', 'description': 'Educational Resources'},
        {'name': 'Engineering', 'description': 'Engineering'},
        {'name': 'English Instruction', 'description': 'English Instruction'},
        {'name': 'Environment', 'description': 'Environment'},
        {'name': 'Fractions', 'description': 'Fractions'},
        {'name': 'Geography', 'description': 'Geography'},
        {'name': 'Government and Politics', 'description': 'Government and Politics'},
        {'name': 'Grammar', 'description': 'Grammar'},
        {'name': 'Health', 'description': 'Health'},
        {'name': 'Health Activities', 'description': 'Health Activities'},
        {'name': 'Human Geography', 'description': 'Human Geography'},
        {'name': 'Language Arts', 'description': 'Language Arts'},
        {'name': 'Local Issues', 'description': 'Local Issues'},
        {'name': 'Maps', 'description': 'Maps'},
        {'name': 'Mathematics', 'description': 'Mathematics'},
        {'name': 'Microbiology', 'description': 'Microbiology'},
        {'name': 'Multiplication', 'description': 'Multiplication'},
        {'name': 'Natural Disasters', 'description': 'Natural Disasters'},
        {'name': 'Natural Resources', 'description': 'Natural Resources'},
        {'name': 'Peoples and Cultures', 'description': 'Peoples and Cultures'},
        {'name': 'Physics', 'description': 'Physics'},
        {'name': 'Reading', 'description': 'Reading'},
        {'name': 'Reference Materials', 'description': 'Reference Materials'},
        {'name': 'Religion', 'description': 'Religion'},
        {'name': 'Safety', 'description': 'Safety'},
        {'name': 'Safety Education', 'description': 'Safety Education'},
        {'name': 'Sciences', 'description': 'Sciences'},
        {'name': 'Social Problems', 'description': 'Social Problems'},
        {'name': 'Space Sciences', 'description': 'Space Sciences'},
        {'name': 'Subtraction', 'description': 'Subtraction'},
        {'name': 'Technology', 'description': 'Technology'},
        {'name': 'Time', 'description': 'Time'},
        {'name': 'Wildlife', 'description': 'Wildlife'},
        {'name': 'Zoology', 'description': 'Zoology'},
    ]
    Subject = apps.get_model('content_management', 'Subject')
    for each_subject in SUBJECTS:
        Subject.objects.create(**each_subject)

def persist_default_workareas(apps, schema_editor):
    WORK_AREAS = [
        {'name': 'Agriculture', 'description': 'Agriculture'},
        {'name': 'Community Economic Development', 'description': 'Community Economic Development'},
        {'name': 'Education', 'description': 'Education'},
        {'name': 'Environment', 'description': 'Environment'},
        {'name': 'Health', 'description': 'Health'},
        {'name': 'Youth in Development', 'description': 'Youth in Development'},
    ]
    Workarea = apps.get_model('content_management', 'Workarea')
    for each_work_area in WORK_AREAS:
        workarea = Workarea(**each_work_area)
        workarea.save()

def persist_default_languages(apps, schema_editor):
    LANGUAGES = [
        {'name': 'Bislama', 'description': 'Bislama'},
        {'name': 'Chuukese', 'description': 'Chuukese'},
        {'name': 'English', 'description': 'English'},
        {'name': 'Kosraean', 'description': 'Kosraean'},
        {'name': 'Pohnpeian', 'description': 'Pohnpeian'},
        {'name': 'Samoan', 'description': 'Samoan'},
        {'name': 'Tonga (Tonga Islands)', 'description': 'Tonga (Tonga Islands)'},
        {'name': 'Yapese', 'description': 'Yapese'},
    ]
    Language = apps.get_model('content_management', 'Language')
    for each_lang in LANGUAGES:
        Language.objects.create(**each_lang)


class Migration(migrations.Migration):
    dependencies = [('content_management', '0012_all_kinds_of_tags'), ]

    operations = [
        migrations.RunPython(persist_default_coverages, migrations.RunPython.noop),
        migrations.RunPython(persist_default_subjects, migrations.RunPython.noop),
        migrations.RunPython(persist_default_workareas, migrations.RunPython.noop),
        migrations.RunPython(persist_default_languages, migrations.RunPython.noop),
    ]
