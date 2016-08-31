'use strict'

/**
 * Module Dependencies
 */
const stream = require('getstream'),
      config = require('./config')

/**
 * Initialize Stream
 */
const client = stream.connect(config.stream.key, config.stream.secret, config.stream.id)

/**
 * Initialize Feed
 */
const timeline = client.feed('timeline', 1)

/**
 * Loop & Generate Activities
 */
for (let i = 1; i < 11; i++) {

    /**
     * Build Random Activity
     */
    timeline.addActivity({
        actor: 1,
        tweet: 'hello world!',
        verb: 'tweet',
        object: i
    })

}
