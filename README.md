# Massikassi expense sharer

## Example app (ie. "production")

Running at http://www.massikassi.com/

## Setting up

### Prerequisites

* postgres, npm, grunt-cli and bower installed.

### Installation

* Clone repository, `git clone git@github.com:mkirvela/massikassi.git`
* Create DB for massikassi `createdb -E UTF-8 massikassi`
* run `npm install`
* run `bower install`
* run `node db/schema.js`
* run `grunt watch` in a separate console
* run `node server` in a console
* Go to http://localhost:3000/
