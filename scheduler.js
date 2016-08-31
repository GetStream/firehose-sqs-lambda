'use strict'

/**
 * Module Dependencies
 */
const redis  = require('redis'),
      moment = require('moment'),
      config = require('./config')

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
 * Fetch * Every 15 Minutes
 */
var fetch = function() {

    // extract N data from timeline feed
    client.spop('changed_feeds', 1000000, function(err, changedFeeds) {

        // catch error
        if (err) {
            console.log(err)
            return
        } else if (!changedFeeds.length) {
            console.log('No feed changes in the past 15 minutes...')
            return
        }

        // loop through user data
        changedFeeds.forEach(feed => {

            // unix timestamp from 15 minutes ago
            const ago = moment(moment().subtract(15, 'minutes')).unix()

            // get all activities in system from N minutes ago
            client.zrangebyscore(`new-activities-${feed}`, ago, '+inf', function(err, res) {

                // catch error
                if (err) {
                    console.log(err)
                    return
                }

                // notify user of activity
                notify(feed, res)

            })

        })

    })

    setTimeout(fetch, 900000)

}
fetch()

/**
 * Lookup User & Notify
 */
function notify(feed, activity) {

    const user = feed.split(':')[1] // user id

    console.log(`Use example documentation to send iOS or Android notifcation to user ${user}`)

    // db.query(`SELECT * FROM users WHERE id = ?`, [val], function(err, res) {
    //
    //     // Option 1) - iOS
    //     const apn = require('apn') // https://github.com/argon/node-apn
    //
    //     // create connection to APN gateway server
    //     const apnConnection = new apn.Connection({
    //         cert: 'cert.pem',
    //         key: 'key.pem'
    //     })
    //
    //     // create device object passing token as hexidecimal string or buffer object (containing the token in binary form)
    //     const device = new apn.Device(token),
    //
    //     // build notification object
    //     let note = new apn.Notification()
    //         note.expiry = Math.floor(Date.now() / 1000) + 3600 // expires 1 hour from now.
    //         note.badge = 3
    //         note.sound = 'ping.aiff'
    //         note.alert = 'You have a new message from Stream'
    //         note.payload = activity
    //
    //     // send notification
    //     apnConnection.pushNotification(note, device)
    //
    //     // Option 2) - Android
    //     const gcm = require('node-gcm') // https://www.npmjs.com/package/node-gcm
    //
    //     // build payload
    //     const msg = new gcm.Message({
    //         data: activity
    //     })
    //
    //     // build credential list
    //     const senderToken = new gcm.Sender('YOUR_API_KEY_HERE'), // extract key from database query
    //           regToken    = ['YOUR_REG_TOKEN_HERE'] // extract token from database query
    //
    //     // send
    //     sender.send(msg, { registrationTokens: regToken }, function (err, response) {
    //         if(err) {
    //             console.log(err)
    //             return
    //         }
    //         console.log(response)
    //     })
    //
    // })

}
