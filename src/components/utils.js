import Axios from 'axios'
import {sparqlEndpoint} from './config';
import $ from 'jquery';

export function loadXMLDoc(url){
  //See https://github.com/martin-honnen/martin-honnen.github.io/blob/master/xslt/arcor-archive/2016/test2016081501.html
  return new Promise(function(resolve) {
    var req = new XMLHttpRequest();
    req.open("GET", url);
    if (typeof XSLTProcessor === 'undefined') {
     try {
       req.responseType = 'msxml-document';
     }
     catch (e) {
       console.log('error', e)
     }
    }
    req.onload = function() {
     resolve(this.responseXML)
    }
    req.send();
  });
}

export function convertXMLDoc(xmlurl, xslurl){
  //See https://github.com/martin-honnen/martin-honnen.github.io/blob/master/xslt/arcor-archive/2016/test2016081501.html
  return new Promise(function(resolve){
    Promise.all([loadXMLDoc(xmlurl), loadXMLDoc(xslurl)]).then(function(data) {
      const xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(data[1]);
      const resultDocument = xsltProcessor.transformToFragment(data[0], document);
      resolve(resultDocument)
    })
  })
}

export function nsResolver(prefix) {
    if(prefix === "tei") {
      return 'http://www.tei-c.org/ns/1.0'
    }
}

export function copyToClipboard(string){
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = string;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

export function runQuery(query){
  //const sparqlEndpoint = "https://sparql-docker.scta.info/ds/query"
  //const sparqlEndpoint = sparqlEndpoint
  const queryPromise = Axios.get(sparqlEndpoint, { params: { "query": query, "output": "json" } })
  return queryPromise
}

//handles scroll to paragraph procedure
export function scrollToParagraph(hash, highlight){
    const element = $("#" + hash);

    // TODO: highlighting is NOT working
    if (highlight){
      element.addClass("highlightNone");
      $(".paragraphnumber").removeClass("highlight2")
      $(".plaoulparagraph").removeClass("highlightNone")
      $(".plaoulparagraph").removeClass("highlight")
      element.children(".paragraphnumber").addClass("highlight2")
      element.addClass( "highlight");
      setTimeout(function(){
        element.addClass("highlightNone");
    }, 2000);

    }
  	if (element.length > 0) {
  	    $('html, body')
              .stop()
              .animate({
                  scrollTop: element.offset().top - 100
              }, 1000);
     }

  }