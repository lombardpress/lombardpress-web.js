import React from 'react';
import {Link} from 'react-router-dom';
import Axios from 'axios'

//TODO: these retrieves need to be refactored into; 
// if exist db api is improved then a single request should be easier
export function retrieveExpressionResults(searchTerm, searchEid){
  const expressionShortId = searchEid === "all" ? searchEid : searchEid.split("/resource/")[1]
  const url = "https://exist.scta.info/exist/apps/scta-app/jsonsearch/json-search-text-by-expressionid.xq?query=" + searchTerm + "&expressionid=" + expressionShortId
  const queryPromise = Axios.get(url)
  return queryPromise
}
export function retrieveAuthorResults(searchTerm, searchAuthor){
  const authorShortId = searchAuthor.split("/resource/")[1]
  const url = "https://exist.scta.info/exist/apps/scta-app/jsonsearch/json-search-text-by-authorid.xq?query=" + searchTerm + "&authorid=" + authorShortId
  const queryPromise = Axios.get(url)
  return queryPromise

}
export function retrieveWorkGroupResults(searchTerm, searchWorkGroup){
  const workGroupShortId = searchWorkGroup.split("/resource/")[1]
  const url = "https://exist.scta.info/exist/apps/scta-app/jsonsearch/json-search-text-by-workGroupId.xq?query=" + searchTerm + "&workGroupId=" + workGroupShortId
  const queryPromise = Axios.get(url)
  return queryPromise

}

export function displayTextResults(results){
  if (!results || results.length === 0){
    return (<div>
      <p>No results found</p>
    </div>)
  }
  else if (results.length > 0){
    const textResults = results.map((r, i) => {
      const textString = r.previous + " <span class='highlight'>" + r.hit + "</span> " + r.next
      const range = r.start + "-" + r.end
      return (
        <div key={i}>
        <p><Link to={"/text?resourceid=http://scta.info/resource/" + r.pid + "@" + range}>{r.pid + "@" + range}</Link></p>
        <p dangerouslySetInnerHTML={{ __html: textString}}/>
        </div>
      )

    })
    return (
      <div>
          <p>{results.length + " results"}</p>
          {textResults}
      </div>
    )
  }
  else if (results){
    const r = results
    const textString = r.previous + " <span class='highlight'>" + r.hit + "</span> " + r.next
    const range = r.start + "-" + r.end
    return (
      <div>
        <p>{1 + " results"}</p>
      <div key={results.pid}>
      <p><Link to={"/text?resourceid=http://scta.info/resource/" + r.pid + "@" + range}>{r.pid + "@" + range}</Link></p>
      <p dangerouslySetInnerHTML={{ __html: textString}}/>
      </div>
      </div>
    )
  }
  else{
    return (
      <div><p>No results</p></div>
    )
  }
}

export function displayQuestionResults(results, searchParameters){
  if (results.length > 0){
    const displayResults = results.map((r, i) => {
      return (
      <div key={r.resource.value + "-" + i}>
        <p><Link to={"/text?resourceid=" + r.author.value}>{r.authorTitle.value}</Link>: <Link to={"/text?resourceid=" + r.resource.value}>{r.longTitle.value}</Link></p>
        <p>{r.qtitle.value.toLowerCase().replace(searchParameters.searchTerm.toLowerCase(), searchParameters.searchTerm.toUpperCase())}</p>
      </div>
      )
    })
    return (
      <div>
        <p>{displayResults.length + " results"}</p>
        {displayResults}
      </div>
    )
  }
  else{
    return (
      <div>
        <p>No results</p>
      </div>
    )

  }
}
