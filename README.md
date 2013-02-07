Copyright Webdoc Inc. 2012, all rights reserved

## Getting Started

This new command line is very alpha, don't try to use it if your not developping it.
You should still use urturn-cli gem instead of this one (just `gem install urturn-cli` to get started).

### Install dependencies

1. install http://nodejs.org
2. install grunt http://gruntjs.com as a global node module: `npm install -g grunt`

### Install the toolbelt

1. Checkout the source
2. In the toolbelt project folder type `npm install` then `npm link`
3. Use urturn-toolbelt -h to get more help

### Package your expression

1. Go to your expression folder
2. `ur package`
3. Use gem urturn-cli to upload the zip: `urturn -h HOST PATH_TO_ZIP`
