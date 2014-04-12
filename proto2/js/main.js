jQuery(function(){
    google.load('search', '1', {callback: OnLoad});
    function searchComplete(searcher) {
      // Check that we got results
      if (searcher.results && searcher.results.length > 0) {
        var results = searcher.results;
          var newImg = document.createElement('img');
          // There is also a result.url property which has the escaped version
            document.body.style.backgroundImage = 'url(' + results[0].tbUrl + ')'; 
            console.log(results[0].tbUrl);
      }
    }
    
    function OnLoad() {
      // Our ImageSearch instance.
      imageSearch = new google.search.ImageSearch();
    
      // Restrict to extra large images only
      imageSearch.setRestriction(google.search.ImageSearch.RESTRICT_IMAGESIZE,
                                 google.search.ImageSearch.IMAGESIZE_EXTRA_LARGE);
    
      // Here we set a callback so that anytime a search is executed, it will call
      // the searchComplete function and pass it our ImageSearch searcher.
      // When a search completes, our ImageSearch object is automatically
      // populated with the results.
      imageSearch.setSearchCompleteCallback(this, searchComplete, [imageSearch]);
    
      // Find me a beautiful car.
    }
    $("#submit").click(function(){
        var inputtext = document.getElementById('inputtext').value;
        nlp.getParse( inputtext, function(data){
            var results = "";
            for( var i = 0; i<data.words.length; i++){
                console.log(data.words[i].value + ":" + data.words[i].tag);
                if(data.words[i].tag =="NN" || 
                    data.words[i].tag =="NP" || 
                    data.words[i].tag =="NNP" || 
                    data.words[i].tag =="NNPS" || 
                    data.words[i].tag =="VB" || 
                    data.words[i].tag =="JJ"){
                    results = results + ' ' + data.words[i].value;
                }
            }
            console.log(results);
            imageSearch.execute(results);
        });
    
    });
});
