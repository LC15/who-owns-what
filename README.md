[![CircleCI](https://circleci.com/gh/JustFixNYC/who-owns-what.svg?style=svg)](https://circleci.com/gh/JustFixNYC/who-owns-what)

# Who owns what in nyc?

The Who owns What project is a new resource for community organizers and tenant leaders to demystify property ownership and shell company networks across New York City.

With this website, you can find crucial information about who is responsible for your building. The site utilizes a database of 160k other properties to connect the dots and discover other properties that your landlord might own or be associated with. Use this tool to discover what buildings in your neighborhood to organize in, what communities your landlord might be targeting, and if your building might be financially overleveraged.

![Imgur](http://i.imgur.com/cYw4gyU.jpg)


**This project is currently in active development!**

## Architecture

This site is built on top of the critical work done by [@aepyornis](https://github.com/aepyornis) on the [nyc-db](https://github.com/aepyornis/nyc-db) project, which is used to cleanly extract, sanitize, and load [HPD Registration data](http://www1.nyc.gov/site/hpd/about/open-data.page) into a PostgreSQL instance.

Backend logic and data manipulation is largely handled by making calls to PostgreSQL functions and prebuilding results into tables whenever possible to avoid complex queries made per-request. See the [hpd-registration ](https://github.com/aepyornis/nyc-db/tree/master/src/nycdb/sql/hpd_registrations) scripts of `nyc-db` for the SQL code that provides this functionality.

#### Backend

The backend of the app (`/server`) is a simple express build that connects to Postgres using `pg-promise`.

#### Frontend

The frontend of the app (`/client`) is built on top of [create-react-app](https://github.com/facebookincubator/create-react-app). See [`/client/README.md`](client/README.md) for all the info you might need.

## Setup

In order to set things up, you'll need to copy `.env.sample` to `.env` and
edit it as needed:

```
cp .env.sample .env
```

In particular, make sure you configure the `DATABASE_URL` environment variable.

Then you'll want to set up and enter a Python 3 virtual environment:

```
python3 -m venv venv
source venv/bin/activate  # Or 'venv\Scripts\activate' on Windows
pip install -r requirements.txt
```

Then you'll need to load data into the database. If you want to use
real data, which takes a long time to load, you can do so with:

```
python dbtool.py builddb
```

Alternatively, you can load a small test dataset with:

```
python dbtool.py loadtestdata
```

After that, make sure you have node/npm/[yarn](https://yarnpkg.com/en/) and then run:

```
yarn install-all
```

This will grab dependencies for both server and client.

## Running in development

Check `package.json` in the root directory for all options. To run both `express` and `create-react-app` you just need:

```
yarn start
```

from root.

You can visit your local dev instance at http://localhost:3000.

## Alternative: Docker-based development

As an alternative to the aforementioned setup, you can use
[Docker](https://www.docker.com/get-started). Once you've
installed Docker, run:

```
docker-compose run app python dbtool.py loadtestdata
```

This will build a nyc-db with test data, which is must faster
than downloading the whole nyc-db. You can, however, opt to
download the whole thing by running
`docker-compose run app python dbtool.py builddb`, but be
prepared, as it will take a while!

Once you've done that, run:

```
docker-compose run app yarn install-all
```

Then create an `.env` file and edit it as needed:

```
cp .env.sample .env
```

Then start up the server:

```
docker-compose up
```

Visit http://localhost:3000 and you should be good to go! If
you installed test data, you can see useful results by
clicking on the "All Year Management" portfolio on the
home page.

## Tests

Back-end tests are in the [`/tests`](tests/) directory and can be run via
the Python virtualenv:

```
pytest
```

If you're using Docker, this can be done via `docker-compose run app pytest`.

See [`/client/README.md`](client/README.md) for more details on front-end
tests.

## Deploying

Package client-side assets through:

```
cd client && yarn build
```

Your express app will grab static files (i.e. the react app and assets) from `client/build` automatically.

## Cross-browser testing

We use BrowserStack Live to make sure that our sites work across browsers, operating systems, and devices.

![BrowserStack](https://www.browserstack.com/images/layout/browserstack-logo-600x315.png)

## License

JustFix.nyc uses the GNU General Public License v3.0 Open-Source License. See `LICENSE.md` file for the full text.
