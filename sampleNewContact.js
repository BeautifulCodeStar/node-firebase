app.post('/newLead', function (req, res) {

    var leadGenId = req.body.leadGenId;
    var page = new Firebase({page});
    page.once('value', function(snapshot) {
        if (snapshot.hasChild('account')) {
            let pageData = snapshot.val();
            var leadExists = leadsRef.child(req.body.leadGenId).once('value', function(snapshot) {
                if(!(snapshot.val() !== null) && req.body.data.firstName){
                    leadsRef.child(req.body.leadGenId).set({pageId: req.body.pageId, data:req.body.data, source: 'source'}).then(()=>{
                        try{
                            var newHistory = leadsRef.child(req.body.leadGenId).child('history').push();
                            var newHistoryKey = newHistory.key();
                            var accountLead = accountsRef.child(pageData.account).child('leads').push();
                            var accountLeadKey = accountLead.key();
                            var updatedUserData = {};
                            updatedUserData["lead_data/" + req.body.leadGenId + '/history/' + newHistoryKey] = {
                                date: new Date().toString(),
                                event: "Lead Created",
                                type: 'event'
                            };
                            updatedUserData["account_leads/" + pageData.account + '/leads/' + accountLeadKey] = req.body.leadGenId;
        
                            updatedUserData["new_leads/" + pageData.account+'/'+req.body.leadGenId] = true;
                            var number = req.body.data.number;
                            var leadGenId = req.body.leadGenId;
                            if (number && number.length == 10) {
                                var leadExists = conversationsRef.child(pageData.account).child(number).once('value', function (snapshot) {
                                    if (!(snapshot.val() !== null)) {
                                        updatedUserData['conversations/' + pageData.account + '/' + number] = {
                                            senderId: pageData.account,
                                            leadGenId: leadGenId
                                        };
                                        db.update(updatedUserData, function (error) {
                                            if (error) {
                                                console.log("Error updating data:", error);
                                            } else {
                                                var leadCount = accountsRef.child(pageData.account).child('leadCount');
                                                leadCount.transaction(function (current_value) {
                                                    return (current_value || 0) + 1;
                                                });
                                                var analyticsLeadCount = analyticsRef.child(pageData.account).child('totals').child('leads');
                                                analyticsLeadCount.transaction(function (current_value) {
                                                    return (current_value || 0) + 1;
                                                });
                                                var date = new Date();
                                                var dateStamp = date.toISOString().substring(0, 10);
                                                var analyticsLeadCountHistory = analyticsRef.child(pageData.account).child('history').child(dateStamp).child('leads');
                                                analyticsLeadCountHistory.transaction(function (current_value) {
                                                    return (current_value || 0) + 1;
                                                });

                                                /////CANNED RESPONSE

                                                var request = require('request');
                                                request.post({
                                                    //headers: {'content-type': 'application/x-www-form-urlencoded'},
                                                    url: '{cannedMessageUrl}',
                                                    body: {'number': number, 'leadGenId': leadGenId, 'accountId': pageData.account,'source':'source'},
                                                    json: true
                                                }, function (error, response, body) {
                                                    console.log(body);
                                                    if(body){
                                                        console.log(body);
                                                        console.log("success");
                                                        var response = {
                                                            status: 200,
                                                        }
                                                        res.end(JSON.stringify(response));
                                                    }

                                                });
                                            }
                                        });
                                    } else {
                                        console.log("HERE STUCK");
                                        var response = {
                                            status: 200,
                                        }
                                        res.end(JSON.stringify(response));
                                    }
                                });
                            }else{
                                db.update(updatedUserData, function (error) {
                                    if (error) {
                                        console.log("Error updating data:", error);
                                        var response = {
                                            status: 200,
                                        }
                                        res.end(JSON.stringify(response));
                                    } else {
                                        var leadCount = accountsRef.child(pageData.account).child('leadCount');
                                        leadCount.transaction(function (current_value) {
                                            return (current_value || 0) + 1;
                                        });
                                        var analyticsLeadCount = analyticsRef.child(pageData.account).child('totals').child('leads');
                                        analyticsLeadCount.transaction(function (current_value) {
                                            return (current_value || 0) + 1;
                                        });
                                        var date = new Date();
                                        var dateStamp = date.toISOString().substring(0, 10);
                                        var analyticsLeadCountHistory = analyticsRef.child(pageData.account).child('history').child(dateStamp).child('leads');
                                        analyticsLeadCountHistory.transaction(function (current_value) {
                                            return (current_value || 0) + 1;
                                        });
                                        var response = {
                                            status: 200,
                                        }
                                        res.end(JSON.stringify(response));
                                    }
                                });
                            }
                            if(req.body.data['email']){
                                var request = require('request');
                                request.post({
                                    url: '{cannedEmailUrl}',
                                    body: {'email': req.body.data['email'], 'leadGenId': leadGenId, 'accountId': pageData.account,'source':'source'},
                                    json: true
                                }, function (error, response, body) {
                                    console.log(body);
                                    if(body){
                                        console.log(body);
                                        console.log("success");
                                        var response = {
                                            status: 200,
                                        }
                                        res.end(JSON.stringify(response));
                                    }

                                });


                                var response = {
                                    status: 200,
                                }
                                res.end(JSON.stringify(response));

                                ///////

                            }
                        }catch (err){
                            console.log(err);
                        var response = {
                            status: 200,
                        }
                        res.end(JSON.stringify(response));
                    }
                    });
                   
                }
            });
        }
    });

    var response = {
        status  : 200,
        success : 'Updated Successfully'
    }

    res.end(JSON.stringify(response));

});