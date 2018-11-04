# Setting up the development environment

## Installing the requirements
### Database Server

PostgreSQL Server is the preferred database server, and has the connectors included in the Python requirements file. You can also choose to install any database server, but the database connectors for python should be installed accordingly.

Refer to [Django's databases page](https://docs.djangoproject.com/en/2.1/ref/databases/) for more information on which connector to use for your database server.

### RabbitMQ Server

RabbitMQ Server needs to be installed and started, for the SolarSPELL images to be built. This is required by celery, for queueing the image build tasks.

### Library Dependencies
To install the python based libraries, run the command

```
    pip install -r requirements/dev.txt
```

Front-end (React) - Refer [README](<frontend/README.rst>) within `frontend` directory.

### 2. Setup Database
Create a database.

### 3. Setup the .env file
Copy the `env.example` file within the `build_automation` to `.env` file within the same directory, and change the values accordingly. Please note that all the values are required, and should be set before moving to the next step.

### 4. Database Migration
To create the database schema, and to load the seed data, run the command

```
    python manage.py migrate
```

## Running the server
To run the server, use the command,

```
    python manage.py runserver
```

For building SolarSPELL images, celery needs to be started as well.

```
    celery -A content_management.tasks worker
```

## Before a pull-request
For running tests, django test suite should be enough

```
    python manage.py test
```

To check for PEP-8 conformance, run the flake8 utility through

```
    tox -e flake8
```

To run both tests and flake8 in a single command,

```
    tox
```

Before making any commits, please make sure the code follows PEP-8 rules. Also, before making a pull-request, please make sure that it does not break the existing code. (This is only possible with a really good code coverage by the test suite).

## Troubleshooting Dev Env Setup Errors

1. Failed installing the requirement `psycopg2-binary`
    If requirements fail at this stage, search for
    `Error: pg_config executable not found.`

    If you find the above line, the most likely cause is that PostgreSQL is not installed or PostgreSQL's binary executables are not available in your `PATH` environment variable.
    On MacOS, installing the PostgreSQL through Homebrew solved the problem.
    `brew install postgresql`


2. Failed Django migration due to django.core.exceptions.AppRegistryNotReady
    When running `python manage.py migrate`, if you run into `django.core.exceptions.AppRegistryNotReady: Apps aren't loaded yet.`, run the command `python manage.py shell`.
    If you encounter the error `django.core.exceptions.ImproperlyConfigured: Set the <XXXXX> environment variable`, make sure that all the environment variables are set in the `.env` file.
    Then try running the migration again.
