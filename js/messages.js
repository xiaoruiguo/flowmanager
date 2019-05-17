// Copyright (c) 2018 Maen Artimy
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

$(function () {
    var tabObj = Tabs('monitor');
    var bigTree = BigTree();


    var header = '<thead> \
    <th>Time</th> \
    <th>Type</th> \
    <th>Datapath</th> \
    <th>Table</th> \
    <th>Reason</th> \
    <th>Match</th> \
    <th>Buffer ID</th> \
    <th>Cookie</th> \
    <th>Content</th></tr></thead>';

    function build_table() {
        var body = "<tbody></tbody>";
        var content = '<table id="logs" class="logtable sortable">' + header + body + '</table>'
        $('#messages').html(content);
    }

    function add_row(row) {
        if ($('#logs tr').length > 25) {
            $("#logs > tbody tr:first").remove();
        }
        var body = "<tr>"
        body += "<td>" + row[0] + "</td>";
        body += "<td>" + row[1] + "</td>";
        body += "<td>" + row[2] + "</td>";
        body += "<td>" + row[3] + "</td>";
        body += "<td>" + row[4] + "</td>";
        body += "<td>" + row[5].replace('OFPMatch', '') + "</td>";
        body += "<td>" + row[6] + "</td>";
        body += "<td>" + row[7] + "</td>";
        body += "<td class=\"tooltip\"><span>" + row[8] + "</span>" + row[8] + "</td>";
        body += "</tr>";
        $('#logs').append(body);
    }

    var update_stats = {
        update: function (params) {
            j = JSON.parse(params);
            var body = "<div>" + JSON.stringify(j, undefined, 2) + "</div";
            $('#main2').html(body);
            return "";
        },
        log: function (params) {
            row = JSON.parse(params);
            add_row(row)
            return "";
        },
    }

    function receiveMessages() {
        var ws = new WebSocket("ws://" + location.host + "/ws");
        ws.onmessage = function (event) {
            var data = JSON.parse(event.data);

            var result = update_stats[data.method](data.params);

            var ret = { "id": data.id, "jsonrpc": "2.0", "result": result };
            this.send(JSON.stringify(ret));
        }
    }


    function startMonitor() {
        tabObj.buildTabs("#main", ["Messages", "Stats"], "Nothing to show!");
        var $svg = $('<svg width="1116" height="600"></svg>');
        var $messages = $('<div id="messages"></div>');
        tabObj.buildContent('Messages', $messages);
        tabObj.buildContent('Stats', $svg);
        build_table();

        //bigTree.start($svg);
        receiveMessages();
        tabObj.setActive();
    }

    // When the refresh button is clicked, clear the page and start over
    $('.refresh').on('click', function () {
        $('#main').html("");
        startMonitor();
    });

    startMonitor();
});