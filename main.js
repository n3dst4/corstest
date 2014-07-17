$(function () {
    "use strict";
    var urls = [
        "http://topsecret.localhost/CustomerRestService/", 
        "http://localhost/CustomerRestService/"
    ];

    var delay = 600;

    function output (data) {
        $("body").append("<pre>" + data + "</pre>");
    }

    function snafu (msg) {
        $("body").append("<div class=error>" + msg + "</div>");   
    }

    function hooray (msg) {
        $("body").append("<div class=hooray>" + msg + "</div>");   
    }

    function nextAjax () {
        $("body").append("<hr>");
        setTimeout(function () {
            var url = urls.shift();
            if (typeof url === "undefined") return;
            $.ajax({
                url: url,
                dataType: "text",
                type: "GET",
                complete: handleResponse
            });
        }, delay);
    }

    nextAjax();

    function handleResponse (jqXhr, status) {
        $("body").append("<h2>" + this.url + ": " + jqXhr.status + "</h2>");
        if (jqXhr.status === 0) {
            snafu("Request rejected");
            nextAjax();
        }
        else if (jqXhr.status == 401) {
            var data = JSON.parse(jqXhr.responseText);
            var listOfLists =  _.map(data, function (obj) {
                return obj.Links;
            });
            var flattenedList = _.flatten(listOfLists, true);
            var loginLinkObject = _.find(flattenedList, function (link) {
                return link.Relation === "http://api.sportingsolutions.com/rels/login";
            });
            var loginUrl = loginLinkObject.Href;
            attemptLogin(loginUrl);
            output(JSON.stringify(data, null, 4));
        }
        else {
            nextAjax();
        }
    }

    function attemptLogin (loginUrl) {
        $.ajax({
            url: loginUrl,
            dataType: "json",
            type: "POST",
            headers: {
                "X-Auth-Key": "4nM[i@b22", // 
                "X-Auth-User": "sportingsolutions"
            },
            complete: handleLogin
        });
    }

    function handleLogin (jqXhr, status) {
        $("body").append("<h2>" + this.url + ": " + jqXhr.status + "</h2>");
        if (jqXhr.status === 0) {
            snafu("Login request rejected");
        }
        else if (jqXhr.status == 401) {
            snafu("Login failed");
        }
        else if (jqXhr.status == 200) {
            hooray("Login succeeded");
            output(JSON.stringify(JSON.parse(jqXhr.responseText), null, 4));
        }
        else {
            snafu("Something weird happened");
        }
        nextAjax();
    }


});