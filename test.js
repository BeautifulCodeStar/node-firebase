const contact = {
    city: "New York",
    email: "alex@gmail.com",
    firstName: "Alexander",
    lastName: "Alexander",
    number: "88888888",
    state: "NY",
    zip_code: "11207"
}

const cron_rules = {
    body:  "Hi, Are you free for a call?",
    days: 15,
    subject: "Hi there!",
    type: "email"
}

const postContacts = {
    accountId: 'kljkljaldsfasd',
    userId: 'kjkasdfkewwkf12kjfasd',
    contacts: [contact]
}

const postRules = {
    accountId: '-P4adhndsslQbkSD3HNq_',
    userId: 'skdjlalshdf',
    rules: [cron_rules]
}

const topNodes = {
    "accounts" : {
        "-P4adhndsslQbkSD3HNq_" : { // accountId
          "Users" : {
            "-L7BiL6mjkgP85fnPKWy" : "ZI7rJnFo48bHBk4P4h7LDOHn06Q2"
          },
          "businessName" : "Test Account",
          "status" : "active"
        }
      },
      "account_leads" : {
        "-P4adhndsslQbkSD3HNq_" : {
          "leadCount" : 1,
          "leads" : {
            "-LZt10EYrJWpsdwe2kX" : "-KUaRZx1ADUXGxL8oAL" // lead Key
          }
        }
      },
    "lead_data" : {
        "-KUaRZx1ADUXGxL8oAL" : {
          "data" : {
            "firstName" : "Chris",
            "lastName" : "Hanson",
            "number" : 8887779999
          },
          "history" : {
            "-LAWxQXcvj_1KDMLmR0c" : {
              "date": "5/21/2018",
              "event" : "Lead Created",
              "type" : "event"
            }
          },
          "source" : "import"
        }
      }
};

module.exports = {
  contact, 
  cron_rules,
  postRules,
  postContacts,
  topNodes
}