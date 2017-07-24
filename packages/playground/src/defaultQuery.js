export default `
# Hello World!
#
# This is a playground for the nice-sharebase GraphQL wrapper created by
# 0xcaff. The wrapper allows you to talk to the official ShareBase API using
# GraphQL. It uses batching and caching minimize communication with the
# official ShareBase API.
#
# Here, nice-sharebase is running in your browser and dispatching requests to
# the official ShaseBase API. nice-sharebase can also be run on a server to
# handle the batching and caching server-side sending only the required
# information to clients. This is especially useful for devices with transient
# connectivity. The server-side approach is recommended for production.

# TODO: Directions on how to setup server side stuff.

# First, before you make any requests, you will need to obtain a session.
# nice-sharebase provides an abstraction layer over the official ShareBase API to
# maintain non-expiring delegate tokens. You can also use PHOENIX-TOKENs with
# this API. Here's how to get a delegate token, also known as a BOX-TOKEN:

mutation GetDelegateToken {
  authenticate(email: "Sam.Babic@onbase.com", password: "password") {
    token
  }
}

# Now, to make authenticated requests, set the Authorization Header input above
# the toolbox to the token you received, prefixed with BOX-TOKEN like so:
#
#   BOX-TOKEN HzZevdAlgxfxg+/Xqjs1ysmBLtPyBQMoEFm5mgONhBVfLDlqzFHa1M+IQUeKx...
#
# If you want to use a PHOENIX-TOKEN instad of a BOX-TOKEN, simply specify it
# along with its prefix in the Authorization Header input above like so:
#
#   PHOENIX-TOKEN Ojk0Njg0YTJhLTRhZWEtNDg1Ni05NWFmLTIxYzA3N2I5NDZkOQ==
#
# Typically, this information will be passed in the Authorization HTTP header to
# the GraphQL server, but since we are making requests on the client side
# directly to the official ShareBase API, we simply pass it in through the input
# above.

# The extensions object holds information about requests to the official
# ShareBase API which were made to resolve the GraphQL query. Here's what each
# field means:
# * logs is an ordered list of endpoints where were hit to fulfill the request
# * duration is the amount of time it took to create a context, receive and
#   parse the information requested from the official ShareBase API.

# Here's an example query:
query ComplexQuery {
  libraries {
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
}
`;
