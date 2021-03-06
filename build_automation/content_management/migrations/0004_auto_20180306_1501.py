# Generated by Django 2.0.2 on 2018-03-06 22:01

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('content_management', '0003_auto_20180301_1618'),
    ]

    operations = [
        migrations.CreateModel(
            name='Directory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='DirectoryLayout',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('description', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='FilterCriteria',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('operator', models.IntegerField(choices=[(1, 'AND'), (2, 'OR')], null=True)),
                ('left_criteria', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='left_parent', to='content_management.FilterCriteria')),
                ('parent', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='content_management.FilterCriteria')),
                ('right_criteria', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='right_parent', to='content_management.FilterCriteria')),
                ('tag', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='content_management.Tag')),
            ],
        ),
        migrations.AddField(
            model_name='directory',
            name='dir_layout_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dir_layout', to='content_management.DirectoryLayout'),
        ),
        migrations.AddField(
            model_name='directory',
            name='filter_criteria',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='content_management.FilterCriteria'),
        ),
        migrations.AddField(
            model_name='directory',
            name='parent',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='subdirectories', to='content_management.Directory'),
        ),
    ]
