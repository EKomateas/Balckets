'use strict';

(function (balckets, $, undefined) {
    const init = {
        responseWaitInterval: 10000,
        scoreMultiplier: 1,
        score: 0
    };

    const responseWaitIntervalAndScoreMultiplier = [
        [3000, 10000, 10],
        [3300, 8000, 9],
        [3600, 4000, 8],
        [4000, 3200, 7],
        [5000, 1600, 6],
        [6000, 800, 5],
        [7000, 400, 4],
        [8000, 200, 3],
        [9000, 100, 2],
        [10000, 0, 1]
    ];

    const ballDropDuration = 600;
    const emptyBucketsDuration = 1000;
    const maxBallsInBucket = 12;

    var responseWaitInterval = null;
    var scoreMultiplier = null;
    var ballNum = null;
    var score = null;
    var idleTimeout = null;

    var elements = {
        $background: '.background',
        background: {
            effect: {
                start: function () {
                    elements.$background.removeClass(classes.background.blur);
                    elements.$background.addClass(classes.background.unblur);
                },
                end: function () {
                    elements.$background.removeClass(classes.background.unblur);
                    elements.$background.addClass(classes.background.blur);
                }
            },
            change: function () {
                elements.$background.css('background-image', 'url("images/backgrounds/' + scoreMultiplier + '.jpg")');
            }
        },
        $scoreboard: '.scoreboard',
        scoreboard: {
            $score: '.score',
            $multiplier: '.multiplier',
            $quit: '.quit',
            quit: {
                bind: function () {
                    elements.scoreboard.$quit.off('click').off('click').on('click', game.commands.end);
                },
                unbind: function () {
                    elements.scoreboard.$quit.off('click');
                }
            },
            show: function () {
                elements.scoreboard.$score.text(init.score);
                elements.scoreboard.quit.bind();
                elements.$scoreboard.show();
            },
            hide: function () {
                elements.scoreboard.$score.text('');
                elements.$scoreboard.hide();
            },
            update: function () {
                elements.scoreboard.$score.text(score);
                elements.scoreboard.$multiplier.text(scoreMultiplier);
            },
        },
        $bullets: '.bullets',
        bullets: {
            $left: '.bullets .left',
            $right: '.bullers .right',
            show: function () {
                elements.$bullets.show();
            },
            hide: function () {
                elements.$bullets.hide();
            }
        },
        $ball: '.ball',
        ball: {
            $number: '.ball .number',
            show: function (callback) {
                elements.ball.$number.text(ballNum);
                elements.$ball.fadeIn(function () {
                    elements.$ball.addClass(classes.ball.shrink[responseWaitInterval]);
                    callback();
                });
            },
            dropToLeftBucket: function (callback) {
                elements.$ball.removeClass(classes.ball.shrink[responseWaitInterval]);
                elements.$ball.addClass(classes.ball.drop.toLeftBucket);
                setTimeout(function () {
                    elements.$ball.removeClass(classes.ball.drop.toLeftBucket);
                    elements.ball.hide();
                    elements.buckets.left.$balls.append(elements.buckets.bucketBall.html.replace('?', ballNum));
                    callback();
                }, ballDropDuration);
            },
            dropToTrashBucket: function (callback) {
                elements.$ball.removeClass(classes.ball.shrink[responseWaitInterval]);
                elements.$ball.addClass(classes.ball.drop.toTrashBucket);
                setTimeout(function () {
                    elements.$ball.removeClass(classes.ball.drop.toTrashBucket);
                    elements.ball.hide();
                    elements.buckets.trash.$balls.append(elements.buckets.bucketBall.html.replace('?', ballNum));
                    callback();
                }, ballDropDuration);
            },
            dropToRightBucket: function (callback) {
                elements.$ball.removeClass(classes.ball.shrink[responseWaitInterval]);
                elements.$ball.addClass(classes.ball.drop.toRightBucket);
                setTimeout(function () {
                    elements.$ball.removeClass(classes.ball.drop.toRightBucket);
                    elements.ball.hide();
                    elements.buckets.right.$balls.append(elements.buckets.bucketBall.html.replace('?', ballNum));
                    callback();
                }, ballDropDuration);
            },
            reset: function () {
                elements.$ball.removeClass(classes.ball.shrink[responseWaitInterval]);
                elements.$ball.removeClass(classes.ball.drop.toLeftBucket);
                elements.$ball.removeClass(classes.ball.drop.toTrashBucket);
                elements.$ball.removeClass(classes.ball.drop.toRightBucket);
            },
            hide: function () {
                elements.$ball.hide();
            }
        },
        $logo: '.logo',
        logo: {
            effect: {
                start: function () {
                    elements.$logo.addClass(classes.logo.shrink);
                },
                end: function () {
                    elements.$logo.removeClass(classes.logo.shrink);
                }
            }
        },
        $buttons: '.buttons',
        buttons: {
            $left: '.buttons .left',
            left: {
                bind: function () {
                    elements.buttons.$left.off('click').on('click', game.commands.dropBallToLeftBucket);
                    elements.buckets.$left.off('click').on('click', game.commands.dropBallToLeftBucket);
                },
                unbind: function () {
                    elements.buttons.$left.off('click');
                    elements.buckets.$left.off('click');
                }
            },
            $right: '.buttons .right',
            right: {
                bind: function () {
                    elements.buttons.$right.off('click').on('click', game.commands.dropBallToRightBucket);
                    elements.buckets.$right.off('click').on('click', game.commands.dropBallToRightBucket);
                },
                unbind: function () {
                    elements.buttons.$right.off('click');
                    elements.buckets.$right.off('click');
                }
            },
            show: function (complete) {
                if (!complete) complete = false;
                elements.buttons.$left.removeClass('disabled');
                elements.buttons.$right.removeClass('disabled');
                if (complete) {
                    elements.buttons.$left.show();
                    elements.buttons.$right.show();
                }
                elements.$buttons.show();
            },
            hide: function (complete) {
                if (!complete) complete = false;
                elements.buttons.$left.addClass('disabled');
                elements.buttons.$right.addClass('disabled');
                if (complete) {
                    elements.buttons.$left.hide();
                    elements.buttons.$right.hide();
                }
            },
            bind: function () {
                elements.buttons.left.bind();
                elements.buttons.right.bind();
                elements.buckets.$trash.off('click').on('click', game.commands.dropBallToTrashBucket);
                $(document).off('keydown').on('keydown', function(e) {
                    switch (e.which) {
                        case 37:
                            game.commands.dropBallToLeftBucket();
                            break;
                        case 39:
                            game.commands.dropBallToRightBucket();
                            break;
                        case 40:
                            game.commands.dropBallToTrashBucket();
                            break;
                    }
                });
            },
            unbind: function () {
                elements.buttons.left.unbind();
                elements.buttons.right.unbind();
                elements.buckets.$trash.off('click');
                $(document).off('keydown');
            }
        },
        $popup: '.popup',
        popup: {
            $welcome: '.popup .welcome',
            welcome: {
                $play: '.popup .welcome .play',
                play: {
                    bind: function () {
                        elements.popup.welcome.$play.off('click').on('click', function () {
                            elements.popup.$welcome.hide();
                            game.commands.start();
                        });
                    },
                    unbind: function () {
                        elements.popup.welcome.$play.off('click');
                    },
                },
                $howToPlay: '.popup .welcome .howToPlay',
                howToPlay: {
                    bind: function () {
                        elements.popup.welcome.$howToPlay.off('click').on('click', function () {
                            elements.popupTop.instructions.show();
                        });
                    },
                    unbind: function () {
                        elements.popup.welcome.$howToPlay.off('click');
                    }
                },
                show: function () {
                    elements.$popup.show();
                    elements.popup.$welcome.show();
                    elements.popup.welcome.play.unbind();
                    elements.popup.welcome.howToPlay.unbind();
                    elements.popup.welcome.play.bind();
                    elements.popup.welcome.howToPlay.bind();
                },
                hide: function () {
                    elements.popup.welcome.play.unbind();
                    elements.popup.welcome.howToPlay.unbind();
                    elements.popup.$welcome.hide();
                    elements.$popup.hide();
                },

            },
        },
        $popupTop: '.popupTop',
        popupTop: {
            $gameOver: '.popupTop .gameOver',
            gameOver: {
                $gameInfo: '.popupTop .gameOver .gameInfo',
                gameInfo: {
                    $score: '.popupTop .gameOver .gameInfo .score',
                },
                $closePopup: '.popupTop .gameOver .closePopup',
                closePopup: {
                    bind: function (callback) {
                        elements.popupTop.gameOver.$closePopup.off('click').on('click', function () {
                            elements.popupTop.gameOver.hide(callback);
                        });
                    },
                    unbind: function () {
                        elements.popupTop.gameOver.$closePopup.off('click');
                    }
                },
                show: function (callback) {
                    elements.$popupTop.show();
                    elements.popupTop.gameOver.closePopup.bind(callback);
                    elements.popupTop.gameOver.gameInfo.$score.text(score);
                    elements.popupTop.$gameOver.show();
                },
                hide: function (callback) {
                    elements.popupTop.gameOver.closePopup.unbind();
                    elements.popupTop.$gameOver.hide();
                    elements.$popupTop.hide();
                    callback();
                }
            },
            $instructions: '.popupTop .instructions',
            instructions: {
                $closePopup: '.popupTop .instructions .closePopup',
                closePopup: {
                    bind: function () {
                        elements.popupTop.$instructions.off('click').on('click', function () {
                            elements.popupTop.instructions.hide();
                        });
                    },
                    unbind: function () {
                        elements.popupTop.$instructions.off('click');
                    }
                },
                show: function () {
                    elements.$popupTop.show();
                    elements.popupTop.instructions.closePopup.bind();
                    elements.popupTop.$instructions.slideDown();
                },
                hide: function () {
                    elements.popupTop.instructions.closePopup.unbind();
                    elements.popupTop.$instructions.hide();
                    elements.$popupTop.hide();
                }
            }
        },
        $buckets: '.buckets',
        buckets: {
            bucketBall: {
                html: '<div class="bucketBall"><div class="number">?</div></div>',
                selector: '.bucketBall',
                remove: function () {
                    $(elements.buckets.bucketBall.selector).addClass(classes.removeBucketBall);
                },
            },
            $left: '.buckets .left',
            left: {
                $balls: '.buckets .left .balls',
                balls: {
                    count: 0,
                    sum: 0,
                    empty: function () {
                        elements.buckets.left.$balls.empty();
                        elements.buckets.left.balls.count = 0;
                        elements.buckets.left.balls.sum = 0;
                        elements.buckets.$left.removeClass(classes.emptyLeftBucket);
                    }
                },
                empty: function () {
                    elements.buckets.$left.addClass(classes.emptyLeftBucket);
                }
            },
            $trash: '.buckets .trash',
            trash: {
                $balls: '.buckets .trash .balls',
                balls: {
                    count: 0,
                    sum: 0,
                    empty: function () {
                        elements.buckets.trash.$balls.empty();
                        elements.buckets.trash.balls.count = 0;
                        elements.buckets.trash.balls.sum = 0;
                        elements.buckets.$trash.removeClass(classes.emptyTrashBucket);
                    }
                },
                empty: function () {
                    elements.buckets.$trash.addClass(classes.emptyTrashBucket);
                }
            },
            $right: '.buckets .right',
            right: {
                $balls: '.buckets .right .balls',
                balls: {
                    count: 0,
                    sum: 0,
                    empty: function () {
                        elements.buckets.right.$balls.empty();
                        elements.buckets.right.balls.count = 0;
                        elements.buckets.right.balls.sum = 0;
                        elements.buckets.$right.removeClass(classes.emptyRightBucket);
                    }
                },
                empty: function () {
                    elements.buckets.$right.addClass(classes.emptyRightBucket);
                }
            },
            empty: function (callback) {
                elements.buckets.left.empty();
                elements.buckets.trash.empty();
                elements.buckets.right.empty();
                elements.buckets.bucketBall.remove();
                setTimeout(function () {
                    elements.buckets.left.balls.empty();
                    elements.buckets.trash.balls.empty();
                    elements.buckets.right.balls.empty();
                    $(elements.buckets.bucketBall.selector).removeClass(classes.removeBucketBall);
                    callback();
                }, emptyBucketsDuration);
            }
        },
    };

    var classes = {
        background: {
            blur: 'blur',
            unblur: 'unblur'
        },
        logo: {
            shrink: 'shrink'
        },
        ball: {
            drop: {
                toLeftBucket: 'dropBallToLeftBucket',
                toTrashBucket: 'dropBallToTrashBucket',
                toRightBucket: 'dropBallToRightBucket'
            },
            shrink: {
                10000: 'shrink10000',
                9000: 'shrink9000',
                8000: 'shrink8000',
                7000: 'shrink7000',
                6000: 'shrink6000',
                5000: 'shrink5000',
                4000: 'shrink4000',
                3000: 'shrink3000',
            },
        },
        emptyLeftBucket: 'emptyLeftBucket',
        emptyTrashBucket: 'emptyTrashBucket',
        emptyRightBucket: 'emptyRightBucket',
        removeBucketBall: 'removeBucketBall'
    };

    var game = {
        commands: {
            start: function () {
                game.initialize();
                game.showElements();
                elements.scoreboard.update();
                elements.background.change();
                game.loop();
            },
            end: function () {
                clearTimeout(idleTimeout);
                elements.buttons.unbind();
                elements.buttons.hide();
                game.hideElements();
                elements.popupTop.gameOver.show(function () {
                    elements.ball.reset();
                    elements.buckets.empty(elements.popup.welcome.show);
                });
            },
            goal: function () {
                var i, oldMultiplier = scoreMultiplier;
                score += elements.buckets.left.balls.sum - elements.buckets.trash.balls.sum;
                if (scoreMultiplier < 10) {
                    for (i = 0; i < responseWaitIntervalAndScoreMultiplier.length; i++) {
                        if (score >= responseWaitIntervalAndScoreMultiplier[i][1]) {
                            responseWaitInterval = responseWaitIntervalAndScoreMultiplier[i][0];
                            scoreMultiplier = responseWaitIntervalAndScoreMultiplier[i][2];
                            break;
                        }
                    }
                }
                elements.scoreboard.update();
                if (scoreMultiplier !== oldMultiplier) {
                    elements.background.change();
                }
                elements.buckets.empty(game.loop);
            },
            dropBallToLeftBucket: function () {
                clearTimeout(idleTimeout);
                elements.buttons.unbind();
                elements.buttons.hide();
                if (elements.buckets.left.balls.count >= maxBallsInBucket) {
                    game.commands.end();
                    return;
                }
                elements.ball.dropToLeftBucket(function () {
                    elements.buckets.left.balls.count += 1;
                    elements.buckets.left.balls.sum += ballNum;
                    game.check();
                });
            },
            dropBallToTrashBucket: function () {
                clearTimeout(idleTimeout);
                elements.buttons.unbind();
                elements.buttons.hide();
                if (elements.buckets.trash.balls.count >= maxBallsInBucket) {
                    game.commands.end();
                    return;
                }
                elements.ball.dropToTrashBucket(function () {
                    elements.buckets.trash.balls.count += 1;
                    elements.buckets.trash.balls.sum += ballNum;
                    game.loop();
                });
            },
            dropBallToRightBucket: function () {
                clearTimeout(idleTimeout);
                elements.buttons.unbind();
                elements.buttons.hide();
                if (elements.buckets.right.balls.count >= maxBallsInBucket) {
                    game.commands.end();
                    return;
                }
                elements.ball.dropToRightBucket(function () {
                    elements.buckets.right.balls.count += 1;
                    elements.buckets.right.balls.sum += ballNum;
                    game.check();
                });
            }
        },
        showElements: function () {
            elements.background.effect.start();
            elements.logo.effect.start();
            elements.scoreboard.show();
            elements.bullets.show();
            elements.buttons.show(true);
        },
        hideElements: function () {
            elements.background.effect.end();
            elements.logo.effect.end();
            elements.scoreboard.hide();
            elements.bullets.hide();
            elements.buttons.hide(true);
            elements.ball.hide();
        },
        initialize: function () {
            responseWaitInterval = init.responseWaitInterval;
            scoreMultiplier = init.scoreMultiplier;
            score = init.score;
        },
        newBall: function () {
            ballNum = parseInt(Math.random().toString().substr(-1, 1));
            var p, d = Math.abs(elements.buckets.left.balls.sum - elements.buckets.right.balls.sum);
            if (ballNum == d || d == 0 || d > 9) {
                return;
            }
            p = parseInt(Math.random().toString().substr(-3, 3));
            if (elements.buckets.left.balls.count > 5 && elements.buckets.right.balls.count > 5) {
                if (p > 800) {
                    ballNum = d;
                }
                return;
            }
            if (elements.buckets.left.balls.count > 9 && elements.buckets.right.balls.count > 9) {
                if (p > 500) {
                    ballNum = d;
                }
                return;
            }
        },
        loop: function () {
            game.newBall();
            elements.ball.show(function () {
                elements.buttons.show();
                elements.buttons.unbind();
                elements.buttons.bind();
                idleTimeout = setTimeout(game.commands.dropBallToTrashBucket, responseWaitInterval);
            });
        },
        check: function () {
            if (elements.buckets.left.balls.sum == elements.buckets.right.balls.sum) {
                game.commands.goal();
            } else {
                game.loop();
            }
        }
    };

    function $elements(elems) {
        if (!elems) elems = elements;
        var each;
        for (each in elems) {
            if (typeof elems[each] === 'object') {
                $elements(elems[each]);
            } else {
                if (each.substr(0, 1) == '$') elems[each] = $(elems[each]);
            }
        }
    }

    balckets.run = function () {
        $elements();
        elements.popup.welcome.show();
    };

}(window.balckets = window.balckets || {}, jQuery));
