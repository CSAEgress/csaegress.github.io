var disqus_config;
function get_disqus_config(url, path){
    return function(){
        this.page.url = url;
        this.page.identifier = path;
    }
}

function loadDisqus(){
    var hash = window.location.hash.split("#");
    if(hash.length != 3) return;
    disqus_config = get_disqus_config(hash[1], hash[2]);

    (function() { // DON'T EDIT BELOW THIS LINE
        var d = document, s = d.createElement('script');
        s.src = 'https://csaegress.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();
}

$(function(){
    console.log("hi");
    loadDisqus();

});
