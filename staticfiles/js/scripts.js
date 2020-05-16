"use strict";
$(document).ready(function() {


    /*------------ Start site menu  ------------*/

    // Start sticky header
    $(window).on('scroll', function() {
        if ($(window).scrollTop() >= 150) {
            $('#sticky-header').addClass('sticky-menu');
        } else {
            $('#sticky-header').removeClass('sticky-menu');
        }
    });

    // slicknav
    $('ul#navigation').slicknav({
        prependTo: ".responsive-menu-wrap"
    });

    $("#metismenu").metisMenu();


    /* scroll bar */
    $('.scrollbar-macosx').scrollbar();

    $('.sidebar-icon').on('click', function() {
        $('.nimmu-sidebar').toggleClass('nimmu-sidebar-hide');
    });

    $('.sidebar-icon').on('click', function() {
        $(this).toggleClass('sidebar-icon-move');
    });


    $(".nimmu-right-sidebar-show-btn").on('click', function() {
        $('.nimmu-right-sidebar').removeClass('nimmu-right-sidebar-hide');
    });
    $(".nimmu-right-bar-close").on('click', function() {
        $('.nimmu-right-sidebar').addClass('nimmu-right-sidebar-hide');
    });

    $(".nimmu-live-chat-btn").on('click', function() {
        $('.nimmu-chat-bot').toggleClass('nimmu-chat-bot-hide');
    });

    $(".nimmu-collaps-menu").on('click', function() {
        $('.nimmu-sidebar').toggleClass('nimmu-sidebar-collapsed');
        $('.nimmu-wrapper').toggleClass('nimmu-wrapper-expend');
        $('.logo-large').toggleClass('d-none');
        $('.logo-small').toggleClass('d-block');
    });

    $(".nimmu-sidebar").on('mouseenter', function() {
        $(this).removeClass('nimmu-sidebar-collapsed');
        $('.nimmu-wrapper').removeClass('nimmu-wrapper-expend');
        $('.logo-large').removeClass('d-none');
        $('.logo-small').removeClass('d-block');
    });


    $(".nimmu-squared-card-box").on('click', function() {
        $('.nimmu-default-card').toggleClass('nimmu-default-card-square');
    });
    $(".nimmu-box-shadows").on('click', function() {
        $('.nimmu-default-card').toggleClass('nimmu-default-card-shadow');
    });
    $(".nimmu-top-menu").on('click', function() {
        $('.nimmu-sidebar').toggleClass('item-hide');
        $('.nimmu-top-header-primary').toggleClass('item-hide');
        $('.nimmu-header-menu').toggleClass('item-hide');
        $('.nimmu-wrapper').toggleClass('wrapper-expend-full');
    });





    /*
    --------------------------------------
    fullscreen script
    --------------------------------------
    */

    $('.nimmu-fullscreen-btn').on('click', function() {
        var elem = document.querySelector("body");

        function openFullscreen() {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        };

        openFullscreen();
    });



    /* ---------- CHAT BOT ENGINE JS ----------- */

    function chatBot() {

        // current user input
        this.input;

        /**
         * respondTo
         * 
         * return nothing to skip response
         * return string for one response
         * return array of strings for multiple responses
         * 
         * @param input - input chat string
         * @return reply of chat-bot
         */
        this.respondTo = function(input) {

            this.input = input.toLowerCase();

            if (this.match('(hi|sup|hello|hey|hola|howdy)(\\s|!|\\.|$)'))
                return encodeURI("<b>u</b>m... hi?");

            if (this.match('what[^ ]* up') || this.match('sup') || this.match('how are you'))
                return "I am fine and you?";

            if (this.match('l(ol)+') || this.match('(ha)+(h|$)') || this.match('lmao'))
                return "what's so funny?";

            if (this.match('^no+(\\s|!|\\.|$)'))
                return "don't be such a negative nancy :(";

            if (this.match('(cya|bye|see ya|ttyl|talk to you later)'))
                return ["alright, see you around", "good teamwork!"];

            if (this.match('(dumb|stupid|is that all)'))
                return ["hey i'm just a proof of concept", "you can make me smarter if you'd like"];

            if (this.input == 'noop')
                return;

            return input + " what?";
        }

        /**
         * match
         * 
         * @param regex - regex string to match
         * @return boolean - whether or not the input string matches the regex
         */
        this.match = function(regex) {

            return new RegExp(regex).test(this.input);
        }
    }

    /* ---------- START INDEX JS ----------- */

    $(function() {

        // chat aliases
        var you = 'You';
        var robot = 'Chatbot';

        // slow reply by 400 to 800 ms
        var delayStart = 400;
        var delayEnd = 800;

        // initialize
        var bot = new chatBot();
        var chat = $('.chat');
        var waiting = 0;
        $('.busy').text(robot + ' is typing...');

        // submit user input and get chat-bot's reply
        var submitChat = function() {

            var input = $('.input input').val();
            if (input == '') return;

            $('.input input').val('');
            updateChat(you, input);

            var reply = bot.respondTo(input);
            if (reply == null) return;

            var latency = Math.floor((Math.random() * (delayEnd - delayStart)) + delayStart);
            $('.busy').css('display', 'block');
            waiting++;
            setTimeout(function() {
                if (typeof reply === 'string') {
                    updateChat(robot, reply);
                } else {
                    for (var r in reply) {
                        updateChat(robot, reply[r]);
                    }
                }
                if (--waiting == 0) $('.busy').css('display', 'none');
            }, latency);
        }

        // add a new line to the chat
        var updateChat = function(party, text) {

            var style = 'you';
            if (party != you) {
                style = 'other';
            }

            var line = $('<div><span class="party"></span> <span class="text"></span></div>');
            line.find('.party').addClass(style).text(party + ':');
            line.find('.text').text(text);

            chat.append(line);

            chat.stop().animate({ scrollTop: chat.prop("scrollHeight") });

        }

        // event binding
        $('.input').bind('keydown', function(e) {
            if (e.keyCode == 13) {
                submitChat();
            }
        });
        $('.input a').bind('click', submitChat);

        // initial chat state
        updateChat(robot, 'Welcome to this awesome nimmu!');

    });







    /* 
    ----------------------------------------
                trafic chart 
    ----------------------------------------
    */


    Highcharts.chart('nimmu-category-revenue', {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: ['Cell Phone', 'Digital Watch', 'IPads', 'Table/PC', 'Consols']
        },
        yAxis: {
            min: 0,
            title: {
                text: ''
            }
        },
        tooltip: {
            enabled: false,
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
            shared: true
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                pointWidth: 50,
            },
        },
        legend: {
            enabled: false,
        },
        exporting: {
            enabled: false
        },
        series: [{
            name: 'Lost',
            data: [2, 4, 4, 2, 5],
            color: '#0EB7FE'
        }, {
            name: 'Paid',
            data: [2, 2, 8, 2, 1],
            color: '#3B53DB'
        }],
        // DashStyle:'Dash',
    });





    

    

    /* score chart */

    $('.score-chart').percentcircle({
        animate: false,
        diameter: 100,
        guage: 3,
        coverBg: '#fff',
        bgColor: '#efefef',
        fillColor: '#F1682C',
        percentSize: '15px',
        percentWeight: 'normal'
    });

    $('.trust-chart').percentcircle({
        animate: false,
        diameter: 100,
        guage: 3,
        coverBg: '#fff',
        bgColor: '#efefef',
        fillColor: '#BD20D3',
        percentSize: '18px',
        percentWeight: 'normal'
    });



    var options = {
        series: [{
            name: 'PRODUCT D',
            data: [30, 26, 22, 13, 28, 25, 20, 25, 13, 22, 8]
        }],
        chart: {
            type: 'line',
            height: 310,
            stacked: true,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: true
            }
        },
        responsive: [{
            breakpoint: 480,
            options: {}
        }],
        plotOptions: {
            bar: {
                horizontal: false,
            },
        },
        stroke: {
            curve: 'smooth',
        },
        xaxis: {
            type: 'datetime',
            categories: ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT',
                '01/05/2011 GMT', '01/06/2011 GMT', '01/07/2011 GMT', '01/08/2011 GMT', '01/09/2011 GMT', '01/10/2011 GMT', '01/11/2011 GMT'
            ],
        },
    };

    var chart = new ApexCharts(document.querySelector("#adword"), options);
    chart.render();


    /*  */

    am4core.ready(function() {

        // Themes begin
        // am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        var chart = am4core.create("nimmu-brand-revenue", am4charts.XYChart);

        // Add data
        chart.data = [{
            "date": "2015-01-01",
            "ay": 6.5,
            "by": 2.2,
            "aValue": 15,
            "bValue": 10
        }, {
            "date": "2015-01-02",
            "ay": 12.3,
            "by": 4.9,
            "aValue": 8,
            "bValue": 3
        }, {
            "date": "2015-01-03",
            "ay": 12.3,
            "by": 5.1,
            "aValue": 16,
            "bValue": 4
        }, {
            "date": "2015-01-04",
            "ay": 2.8,
            "by": 13.3,
            "aValue": 9,
            "bValue": 13
        }, {
            "date": "2015-01-05",
            "ay": 3.5,
            "by": 6.1,
            "aValue": 5,
            "bValue": 2
        }, {
            "date": "2015-01-06",
            "ay": 5.1,
            "by": 8.3,
            "aValue": 10,
            "bValue": 17
        }];

        // Create axes
        var xAxis = chart.xAxes.push(new am4charts.DateAxis());
        xAxis.dataFields.category = "category";
        xAxis.renderer.grid.template.location = 0;
        //xAxis.renderer.minGridDistance = 30;

        var yAxis = chart.yAxes.push(new am4charts.ValueAxis());

        // Create series
        var series1 = chart.series.push(new am4charts.LineSeries());
        series1.dataFields.valueY = "ay";
        series1.dataFields.dateX = "date";
        series1.dataFields.value = "aValue";
        series1.strokeOpacity = 0;
        series1.cursorTooltipEnabled = false;

        var bullet1 = series1.bullets.push(new am4charts.CircleBullet());
        bullet1.tooltipText = "";
        series1.heatRules.push({
            target: bullet1.circle,
            min: 10,
            max: 30,
            property: "radius"
        });

        var series2 = chart.series.push(new am4charts.LineSeries());
        series2.dataFields.valueY = "by";
        series2.dataFields.dateX = "date";
        series2.dataFields.value = "bValue";
        series2.strokeOpacity = 0;
        series2.cursorTooltipEnabled = false;

        var bullet2 = series2.bullets.push(new am4charts.Bullet());
        bullet2.tooltipText = "";

        // var rectangle2 = bullet2.createChild(am4core.Rectangle);
        // rectangle2.verticalCenter = "middle";
        // rectangle2.horizontalCenter = "middle";
        // rectangle2.width = 10;
        // rectangle2.height = 10;
        // rectangle2.rotation = 45;
        // rectangle2.stroke = am4core.color("#fff");
        // rectangle2.strokeWidth = 1;
        // rectangle2.nonScalingStroke = true;
        // series2.heatRules.push({
        //   target: rectangle2,
        //   min: 10,
        //   max: 60,
        //   property: "radius"
        // });

        // Add scrollbars
        // chart.scrollbarX = new am4core.Scrollbar();
        // chart.scrollbarY = new am4core.Scrollbar();

        // Add cursor
        // chart.cursor = new am4charts.XYCursor();
        chart.cursor.behavior = "";

    }); // end am4core.ready()




});