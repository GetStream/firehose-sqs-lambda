'use strict'

/**
 * Module Depencies
 */
const AWS    = require('aws-sdk')
const redis  = require('redis')
const moment = require('moment')
const config = require('./config')

/**
 * Initialize
 */
const SQS = new AWS.SQS({ apiVersion: '2012-11-05' })
const Lambda = new AWS.Lambda({ apiVersion: '2015-03-31' })

/**
 * Redis Connection
 */
const client = redis.createClient(config.redis.port, config.redis.host)

/**
 * Redis Error
 */
client.on('error', function (err) {
    console.log('Redis Error:', err)
    process.exit(1)
})

/**
 * Handler
 */
exports.handler = (event, context, callback) => {

    /**
     * Connect to Redis
     */
    client.on('connect', function() {

        // parse base64 encoded payload to json
        const payload = JSON.parse(new Buffer(event, 'base64').toString('ascii'))

        // number of items to iterate through
        let ln = payload.length

        // loop through events
        payload.forEach(data => {

            // if the event is old, skip it
            if (!data.new.length) {
                return
            }

            // store the user id in a set, so we know which feeds changed
            client.sadd('changed_feeds', data.feed)

            // keep track of the activities that changed
            data.new.forEach(activity => {
                client.zadd([
                    `new-activities-${data.feed}`,
                    moment(activity.time).unix(),
                    JSON.stringify(activity)
                ])
            })

            // trim the sorted set to only keep the last 10 activities
            client.zremrangebyrank(`new-activities-${data.feed}`, 0, -11, function(err, res) {
                if (err) {
                    console.log(err)
                    return
                }
            })

            // index is at 0, exit using context.succeed
            if (--ln) {
                context.succeed()
            }

        })

    })

}
