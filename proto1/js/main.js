jQuery(function(){
    var isMaskOn = false;
    // Setup Video stuff for local video
    // var video = document.getElementById("videoel");

    // var overlay = document.getElementById('overlay');
    // var overlayCC = overlay.getContext('2d');
    // navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

    // if (navigator.getUserMedia) {       
    //     navigator.getUserMedia({video: true}, handleVideo, videoError);
    // }

    // function handleVideo(stream) {
    //     video.src = window.URL.createObjectURL(stream);
    //     video.play();
    // }

    // function videoError(e) {
    //     // do something
    // }
    
    //Setup face tracking stuff
    var setupFaceTracker = function(id){
        var video = document.getElementById(id);
        var overlay = document.getElementById('overlay');
        var overlayCC = overlay.getContext('2d');

        var ctrack = new clm.tracker({useWebGL : true});
        ctrack.init(pModel);

        function drawLoop() {
            requestAnimFrame(drawLoop);
            overlayCC.clearRect(0, 0, 640, 480);
            if(isMaskOn){
                if (ctrack.getCurrentPosition()) {
                    ctrack.draw(overlay);
                }
            }
            var cp = ctrack.getCurrentParameters();

            var er = ec.meanPredict(cp);
            if (er) {
                for (var i = 0;i < er.length;i++) {
                    if (er[i].value > 0.4) {
                        $("#"+id).removeClass('blurred'); 
                        document.getElementById('icon'+(i+1)).style.visibility = 'visible';
                    } else {
                        $("#"+id).addClass('blurred'); 
                        document.getElementById('icon'+(i+1)).style.visibility = 'hidden';
                    }
                }
            }
        }

        var ec = new emotionClassifier();
        ec.init(emotionModel);
        var emotionData = ec.getBlank();	
        ctrack.start(video);
        drawLoop();
    }

    //Setup WebRTC stuff

    var room = "CS247";

    var webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        //localVideoEl: 'videoel',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: '',
        // immediately ask for camera access
        autoRequestMedia: true,
        debug: false,
        detectSpeakingEvents: true,
        autoAdjustMic: false
    });

    // when it's ready, join if we got a room from the URL
    webrtc.on('readyToCall', function () {
        // you can name it anything
        if (room) webrtc.joinRoom(room);
    });

    webrtc.on('videoAdded', function (video, peer) {
        console.log('video added', peer);
        var remotes = document.getElementById('remote');
        if (remotes) {
            video.width = 640;
            video.height = 480;
            var c = document.createElement("canvas");
            c.id = "overlay";
            c.width = 640;
            c.height = 480;
            remotes.appendChild(video);
            remotes.appendChild(c);
            setupFaceTracker(video.id);
        }
    });

    webrtc.on('videoRemoved', function (video, peer) {
        console.log('video removed ', peer);
        var remotes = document.getElementById('remotes');
        var el = document.getElementById('container_' + webrtc.getDomId(peer));
        if (remotes && el) {
            remotes.removeChild(el);
        }
    });
    
    $('body').keyup(function(event){
        if(event.keyCode == 84){
            isMaskOn = !isMaskOn;
            console.log("isMaskOn:"+ isMaskOn);
        }
    });

    var cur_video_blob = null;
    var fb_instance;

    function connect_to_chat_firebase(){
        /* Include your Firebase link here!*/
        fb_instance = new Firebase("blinding-fire-7653.firebaseio.com");

        // generate new chatroom id or use existing id
        var url_segments = document.location.href.split("/#");
        if(url_segments[1]){
            fb_chat_room_id = url_segments[1];
        }else{
            fb_chat_room_id = Math.random().toString(36).substring(7);
        }
        display_msg({m:"Share this url with your friend to join this chat: "+ document.location.origin+"/#"+fb_chat_room_id,c:"red"});

            // set up variables to access firebase data structure
        var fb_new_chat_room = fb_instance.child('chatrooms').child(fb_chat_room_id);
        var fb_instance_users = fb_new_chat_room.child('users');
        var fb_instance_stream = fb_new_chat_room.child('stream');
        var my_color = "#"+((1<<24)*Math.random()|0).toString(16);

        // listen to events
        fb_instance_users.on("child_added",function(snapshot){
            display_msg({m:snapshot.val().name+" joined the room",c: snapshot.val().c});
        });
        fb_instance_stream.on("child_added",function(snapshot){
            display_msg(snapshot.val());
        });

        // block until username is answered
        var username = window.prompt("Welcome, warrior! please declare your name?");
        if(!username){
            username = "anonymous"+Math.floor(Math.random()*1111);
        }
        fb_instance_users.push({ name: username,c: my_color});
        $("#waiting").remove();

        // bind submission box
        $("#submission input").keydown(function( event ) {
            if (event.which == 13) {
                fb_instance_stream.push({m:username+": " +$(this).val(), c: my_color});
                $(this).val("");
            }
        });
    }

    // creates a message node and appends it to the conversation
    function display_msg(data){
        $("#conversation").append("<div class='msg' style='color:"+data.c+"'>"+data.m+"</div>");
        // Scroll to the bottom every time we display a new message
        scroll_to_bottom(0);
    }

    function scroll_to_bottom(wait_time){
        // scroll to bottom of div
        setTimeout(function(){
            $("html, body").animate({ scrollTop: $(document).height() }, 200);
        },wait_time);
    }
    connect_to_chat_firebase();
});

