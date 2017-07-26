Developing
----------
After running `npm install` on any of the examples, you need to copy the latest
version of nice-sharebase to the `node_modules` directory. See the `.travis.yml`
file for an example. This needs to be done because symlinked depedencies don't
resolve dependencies correctly in node.
