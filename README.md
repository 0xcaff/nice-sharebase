nice-sharebase [![Build Status][build-status-image]][build-status]
==============

[ShareBase][sharebase] is a cloud document storage solution targeted towards
enterprise. This is a GraphQL wrapper around the [official ShareBase
API][official-docs]. It maintains long lived sessions, batches requests and
caches them to resolve queries as fast as possible. [Try it out in the
playground.][playground] [Checkout the schema to see what the API can
do.][schema]

Here's an example of a query you can make against `nice-sharebase`:

    libraries {
      name

      folders {
        folders {
          name
          id
        }

        documents {
          name
          id
        }
      }
    }

It will resolve to:

	{
	  "data": {
	    "libraries": [
	      {
	        "name": "My Library",
	        "folders": [
	          {
	            "folders": [],
	            "documents": [
	              {
	                "name": "Building Mobile Apps Curriculum (INTERNAL).docx",
	                "id": "642793"
	              },
	              {
	                "name": "output (6).docx",
	                "id": "642860"
	              },
	              {
	                "name": "settings.gradle",
	                "id": "648325"
	              }
	            ]
	          },
	          {
	            "folders": [],
	            "documents": []
	          },
	          {
	            "folders": [],
	            "documents": []
	          },
	          {
	            "folders": [],
	            "documents": []
	          },
	          {
	            "folders": [
	              {
	                "name": "121",
	                "id": "108602"
	              }
	            ],
	            "documents": []
	          }
	        ]
	      }
	    ]
	  },
	  "extensions": {
	    "logs": [
	      "https://app.sharebase.com/sharebaseapi/api/libraries",
	      "https://app.sharebase.com/sharebaseapi/api/libraries/2473/folders",
	      "https://app.sharebase.com/sharebaseapi/api/folders/90553?embed=f,d",
	      "https://app.sharebase.com/sharebaseapi/api/folders/95516?embed=f,d",
	      "https://app.sharebase.com/sharebaseapi/api/folders/101633?embed=f,d",
	      "https://app.sharebase.com/sharebaseapi/api/folders/101634?embed=f,d",
	      "https://app.sharebase.com/sharebaseapi/api/folders/108601?embed=f,d"
	    ],
	    "duration": "701ms"
	  }
	}

The `extensions` object shows information about the duration and the requests
made to the official ShareBase API to fulfill the query.

Check out the [`examples`][examples] to see how you can use nice-sharebase in
your own projects.

[playground]: https://0xcaff.github.io/nice-sharebase
[examples]: examples/
[build-status-image]: https://travis-ci.org/0xcaff/nice-sharebase.svg?branch=master
[build-status]: https://travis-ci.org/0xcaff/nice-sharebase
[official-docs]: https://developers.sharebase.com/
[sharebase]: https://sharebase.onbase.com/
[schema]: src/schema.graphql
