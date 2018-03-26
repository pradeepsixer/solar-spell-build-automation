**************************************
Setting up the development environment
**************************************

1. Installing the requirements
##############################
Django
::

     pip install -r requirements/dev.txt

Front-end (React)
::
    cd frontend
    npm install
    (Optionally, add the node_modules/bin/ to PATH Environment Variable)

2. Setup Database
##################
Create a database in postgresql.

3. Copy the env file
####################
Copy the :code:`env.example` file within the :code:`build_automation` to :code:`.env` file within the same directory, and change the values accordingly.

*********************
Before a pull-request
*********************
For running tests, django test suite should be enough
::

     python manage.py test
     
To check for PEP-8 conformance, run the flake8 utility through
::
     tox -e flake8

To run both tests and flake8 in a single command,
::
     tox

Before making any commits, please make sure the code follows PEP-8 rules. Also, before making a pull-request, please make sure that it does not break the existing code. (This is only possible with a really good code coverage by the test suite).
