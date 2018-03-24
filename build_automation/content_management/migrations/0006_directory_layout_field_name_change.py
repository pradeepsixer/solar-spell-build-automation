from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('content_management', '0005_auto_20180313_2211'),
    ]

    operations = [
        migrations.RenameField(
            model_name='Directory',
            old_name='dir_layout_id',
            new_name='dir_layout'
        )
    ]
