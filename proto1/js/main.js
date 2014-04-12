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

    //startVideo();
});
