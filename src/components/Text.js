
import React from 'react';
import Spinner from './Spinner';
import $ from 'jquery';
import {convertXMLDoc, scrollToParagraph, loadHtmlResultDocFromExist, toRange, cleanText} from './utils'
import ReactTooltip from 'react-tooltip';
import Nav from 'react-bootstrap/Nav';
import {FaComments, FaEdit, FaInfo, FaBook} from 'react-icons/fa';

class Text extends React.Component {
  constructor(props){
    super(props)
    this.retrieveText = this.retrieveText.bind(this)
    this.handleOnClick = this.handleOnClick.bind(this)
    this.handleHide = this.handleHide.bind(this)
    this.handleOnClickComment = this.handleOnClickComment.bind(this)
    this.handleDictionaryChange = this.handleDictionaryChange.bind(this)
    
    this.state = {
      fetching: false,
      selectionRange: "",
      //TODO systematic rename of all instances of properties below
      // selectionRect: {left: "", top: ""},
      // selectedText: "",
      // selectedElementTargetId: "",
      // startToken: undefined,
      // endToken: undefined, 
      dictionary: ""
    }


  }
  retrieveText(doc, topLevel, scrollTo, selectionRange){
    const _this = this;
    
    if (doc){
      //construct file url request ot exist db to get a cors enabled copy of the text (github does not serve files with cors enabled)
      const doc = this.props.doc;
      const topLevel = this.props.topLevel;
      const docFragment = doc.split("/master/")[1]
      const topLevelFragment = topLevel.split("/resource/")[1]
      
      let xmlurl = ""
      if (doc.includes("ipfs")){
        xmlurl = doc
      }
      else{
        xmlurl = "https://exist.scta.info/exist/apps/scta-app/text/" + topLevelFragment + "/" + docFragment;
      }
      const xslurl = "/xslt/main_view.xsl"

      //Begin fetch and conversion
      this.setState({fetching: true})
      //frist try to request html converted by eXist
      const resultDocument = loadHtmlResultDocFromExist(xmlurl)
      resultDocument.then((data) => {
        throw "test exception"
        this.setState({fetching: false})
        //appendage to file
        //and event binding
        //happens inside promise call back
        document.getElementById("text").innerHTML = "";
        document.getElementById("text").innerHTML = data.data;
        // add event binding
        this.setEvents(_this, scrollTo)
      })
      .catch((e) => {
        // if eXist conversion fails, do conversion in browser
        const resultDocument = convertXMLDoc(xmlurl, xslurl)
        resultDocument.then((data) => {
          this.setState({fetching: false})
          document.getElementById("text").innerHTML = "";
          document.getElementById("text").appendChild(data)
          // add event binding
          this.setEvents(_this, scrollTo, selectionRange)
          }).catch((e) => {
            //if browswer conversion fails, log error message
            console.log("something went wrong", e)
            document.getElementById("text").innerHTML = "";
            document.getElementById("text").innerHTML = "<p>Apologies, the document is not able to be loaded at this time</p>";
          })
        })
      }
  }

  setEvents(_this, scrollTo, selectionRange){

    $('.paragraphnumber').click(function(e) {
      e.preventDefault();
      const id = $(this).parent("p").attr('id')
      _this.props.setFocus(id)
      _this.props.openWindow("window1")
    });
    if (scrollTo){
     scrollToParagraph(scrollTo, true)
   }
   if(selectionRange){
    const selectedElementTargetId = document.getElementById(scrollTo).id
    console.log("selectedElementTargetId", selectedElementTargetId)
    _this.markWithElement(selectionRange)
  }

   $('.js-show-folio-image').click(function(e) {
     e.preventDefault();
     const surfaceid = $(this).attr('data-surfaceid');
     const paragraphid = $(this).closest('.plaoulparagraph').attr("id");

     _this.props.setFocus(paragraphid)
     _this.props.handleSurfaceFocusChange("http://scta.info/resource/" + surfaceid)
     _this.props.openWindow("window2", "surface2")
   });

   $('.lbp-line-number').click(function(e) {
     e.preventDefault();
     const surfaceid = $(this).attr('data-surfaceid');
     const ln = $(this).attr('data-ln');
     const paragraphid = $(this).closest('.plaoulparagraph').attr("id");

     _this.props.setFocus(paragraphid)
     _this.props.handleSurfaceFocusChange("http://scta.info/resource/" + surfaceid)
     _this.props.handleLineFocusChange("http://scta.info/resource/" + surfaceid + "/" + ln)
     _this.props.openWindow("window2", "surface2")
   });

   $('.appnote, .footnote').click(function(e) {
        e.preventDefault();
        $(this).attr("data-tip", "hello world")
        const link = $(this).parent().children('.appnote, .footnote')
        const target = $(link).attr('href')
        const text = $(target).html()
        const targetText = $(this).parent().children(".note-display").attr('data-target-id')
        
        //capture note display element
        const noteDisplay = $(this).parent().children(".note-display")

        // TODO: the below highlighting procedures seems to work
        // but it could be improved in coordination with the improvement of highlighting and fading paragraph/div 
        // see utils.js for the companion highlighting toggle functions

        /// NOTE: below is an explanation of the conditional
        // toggles highlight for select text segments
        // conditional checks if note display is already showing
        // if not showing, it removes hidden class and highlights target element (quote or ref)
        if (targetText && noteDisplay.attr("class").includes("hidden")){
          noteDisplay.removeClass("hidden")
          $("#" + targetText).addClass("highlight")
          $("span[data-corresp=" + targetText + "]").addClass("highlight")
          $("#" + targetText).removeClass("highlightNone")
          $("span[data-corresp=" + targetText + "]").removeClass("highlightNone")
        }
        // if note display is showing, it removes the display and unhighlights the target elements (quote or ref)
        else{
          noteDisplay.addClass("hidden")
          $("#" + targetText).removeClass("highlight")
          $("span[data-corresp=" + targetText + "]").removeClass("highlight")
          $("#" + targetText).removeClass("highlightNone")
          $("span[data-corresp=" + targetText + "]").removeClass("highlightNone")
        }

        //adds footnote text to noteDisplay Div and toggles hidden class
        
        
        noteDisplay.html(text)
      });

      $(document).on("click", '.js-show-info', function(e) {
         e.preventDefault();
         const id = $(this).attr('data-pid')
         _this.props.setFocus(id)
         _this.props.openWindow("window1")
       });
       if (scrollTo){
        scrollToParagraph(scrollTo, true)
      }

      $(document).on("click", '.show-line-witness', function(e) {

        e.preventDefault();
        const surfaceid = $(this).attr('data-surfaceid');
        const ln = $(this).attr('data-ln');


        const paragraphid = $(this).closest('.plaoulparagraph').attr("id");
        _this.props.setFocus(paragraphid)

        _this.props.handleSurfaceFocusChange("http://scta.info/resource/" + surfaceid)
        _this.props.handleLineFocusChange("http://scta.info/resource/" + surfaceid + "/" + ln)
        _this.props.openWindow("window2", "surface2")
      });

      $(document).on("click", '.js-show-reference-paragraph', function(e){
       e.preventDefault();
       const target = $(this).attr('data-url')
       const targetParagraph = $(this).attr('data-target-resource')
       const start = $(this).attr('data-start')
       const end = $(this).attr('data-end')

       // set the desired text preview focus to the target of the reference
       _this.props.handleTextPreviewFocusChange(target, start, end)
       //opening bottomw window 2 to textPreview
       _this.props.openWindow("window2", "textPreview")

   // NOTE: Order seems to make a difference here (at least in the production version)
   // calling this.props.setFocus before handleTextPreviewFocusChange and openWindow
   // was causing a reload that prevented desired functionality (but not on local version, only on production/deployed version)
   // TODO: investigate further, because even thought the re-arranged order seems to be working
   // the problem is likely to do with async timing (i.e. on job finish before another)
   //which could vary in different enviornments

       //setting paragraph focus for paragraph containing target footnote
       _this.props.setFocus(targetParagraph)
     })



      // function to ancestor paragraph of selection
      function getContainingP(node) {
        while (node) {
            if (node.nodeType === 1 && node.tagName.toLowerCase() === "p") {
                return node;
            }
            node = node.parentElement;
        }
      }
      function mark(e) {
        // hide tooltip
        _this.handleHide();
        //get selection object
        var sel = document.getSelection();
        var rng = sel && sel.getRangeAt(0);
        const pAncestor = getContainingP(rng.commonAncestorContainer)
        //if selection is in a text paragraph
        if (pAncestor && pAncestor.className.includes("plaoulparagraph")){
          console.log("pAncestor", pAncestor);
          console.log("pAncestor.id", pAncestor.id);
          const selectedElementTargetId = pAncestor.id;
          console.log("selectedElementTargetId", selectedElementTargetId);
          var cnt = rng.cloneContents();
          console.log("selected cnt", rng)
          $(cnt).children(".lbp-line-number, .paragraphnumber, br, .lbp-folionumber, .appnote, .footnote, .lbp-reg").remove();
          // if selection is greater than 0 
          if (cnt.textContent.length > 0){
            //get ancestor p text
            const pClone = $(pAncestor).clone()
            pClone.children(".lbp-line-number, .paragraphnumber, br, .lbp-folionumber, .appnote, .footnote, .lbp-reg").remove();
            const pText = cleanText($(pClone).text())
            const selectionText = cleanText(cnt.textContent)
            let precedingTextArray = pText.split(selectionText)[0].split(" "); 
            //slice to remove first item which is paragraph number; filter to remove blank items scattered throughout
            precedingTextArray = precedingTextArray.slice(1).filter(n=>n)
            const precedingTextLength = precedingTextArray.length
            const startToken = precedingTextLength + 1
            // filter to remove blank items in array
            const endToken = precedingTextLength + (selectionText.split(" ").filter(n=>n).length) 
            const wordRange = {start: startToken, end: endToken}
            
            const startCharacter = $(pClone).text().split(cnt.textContent)[0].length + 1 ;
            const endCharacter = $(pClone).text().split(cnt.textContent)[0].length + cnt.textContent.length + 1;
            const characterRange = {start: startCharacter, end: endCharacter}
            const oRect = rng.getBoundingClientRect();
            console.log("test", rng)
            console.log("test", oRect)
            const selectionRange = {
              text: selectionText,
              coords: oRect,
              wordRange, 
              characterRange,
              objectRange: rng,
              selectedElementTargetId, 
            }

            _this.handleOnClick(selectionRange);
          }
        }
      }
      document.addEventListener('keyup', mark); // ctrl+keyup
      document.addEventListener('mouseup', mark);// ctrl+mouseup
    }
    /**
     * 
     * @param {object} selectionRange 
     
     */
    markWithElement(selectionRange){
      const parent = $('mark').parent();
      $('mark').contents().unwrap();
      const container = document.getElementById(selectionRange.selectedElementTargetId);
      //only attempt to set mark if container can be found
      if (container && selectionRange.characterRange){
        const range = toRange(container, selectionRange.characterRange.start, selectionRange.characterRange.end)
        //const range = selectedRangeObject;

        var cnt = range.extractContents();
        var node = document.createElement('mark');
        node.style.backgroundColor = "#BBCEBE";
        node.appendChild(cnt);
        range.insertNode(node);
        //sel.removeAllRanges();

        
        // const mark = document.createElement('mark');
        // $(mark).attr("style", "background-color: lightblue");
        // range.surroundContents(mark);
        }
    }

    /* @editable as boolean if true, then should be edited in comment */
  handleOnClickComment(editable){
    const selectionRange = this.state.selectionRange
    const selectionRangeNew = {
      ...selectionRange,
      editable: editable
    }
    console.log("selectionRangeNew", selectionRangeNew)
    // const selectedRange = {start: this.state.startToken, end: this.state.endToken}
    // const selectedCharacterRange = {start: this.state.startCharacter, end: this.state.endCharacter}

    this.markWithElement(selectionRangeNew);
    this.props.handleOnClickComment(selectionRangeNew);
    // this.props.setFocus(this.state.selectedElementTargetId)
    // this.props.openWindow("window1", "comments")
  }
  
  handleDictionaryChange(dictionary){
    this.setState({dictionary})
  }
  
  
  handleHide(){
    ReactTooltip.hide(this.fooRef)
  }
 
  /**
   * 
   * @param {{
      text: string,
      coords: object,
      wordRange: object, 
      characterRange: object,
      objectRange: Range,
      selectedElementTargetId: string,
    }} selectionRange - object contain needed if about selectedRange
   */
  handleOnClick(selectionRange){
    this.setState({selectionRange: selectionRange})
    console.log("test in click", selectionRange)
    ReactTooltip.show(this.fooRef)
  }
  componentDidMount(){
    // NOTE: ScrollToNew helps ensure that scrollTo id is SCTA ShortID, 
    //since TextWrapper is (at present) sometimes sending the shortid and sometimes the full url id
    // TODO: when TextWrapper is refactored and consistently sending the same ID type. this should be removed
    const scrollToNew = this.props.scrollTo && this.props.scrollTo.includes("/resource/") ? this.props.scrollTo.split("/resource/")[1] : this.props.scrollTo
    this.retrieveText(this.props.doc, this.props.topLevel, scrollToNew, this.props.selectionRange)
  }

  componentDidUpdate(prevProps, prevState){

    //check to see if doc has changed
    if (prevProps.doc !== this.props.doc){
      // NOTE: ScrollToNew helps ensure that scrollTo id is SCTA ShortID, 
      //since TextWrapper is (at present) sometimes sending the shortid and sometimes the full url id
      // TODO: when TextWrapper is refactored and consistently sending the same ID type. this should be removed
      const scrollToNew = this.props.scrollTo && this.props.scrollTo.includes("/resource/") ? this.props.scrollTo.split("/resource/")[1] : this.props.scrollTo
      this.retrieveText(this.props.doc, this.props.topLevel, scrollToNew, this.props.selectionRange)
    }
    // if doc has already been appended, still scroll to target block
    else{
      if (this.props.scrollTo !== prevProps.scrollTo){
        // NOTE: ScrollToNew helps ensure that scrollTo id is SCTA ShortID, 
        //since TextWrapper is (at present) sometimes sending the shortid and sometimes the full url id
        // TODO: when TextWrapper is refactored and consistently sending the same ID type. this should be removed
        const scrollToNew = this.props.scrollTo && this.props.scrollTo.includes("/resource/") ? this.props.scrollTo.split("/resource/")[1] : this.props.scrollTo
        scrollToParagraph(scrollToNew, true)
        if (this.props.selectionRange){
          console.log("firing 1")
          this.markWithElement(this.props.selectionRange)
        };
      }
      // TODO/Note: this seems to be firing even when it seems like the prevProps.doc !== this.props.doc
      // perhaps props are not changing/updating at the same time. So the doc prop has already changed
      // then the range changes and tries to mark element, but the retrieve text asynch request has not finished 
      // and so the marking container element cannot be found. 
      // NOTE: error solved by preventing attempt to mark if container cannot be found. 
      // but it doesn't seem great that this is firing at undesired times.
      else if (this.props.selectionRange.characterRange !== prevProps.selectionRange.characterRange && this.props.selectionRange.selectedElementTargetId){
        console.log("firing 2")
        this.markWithElement(this.props.selectionRange)
      }  
    }
    
  }
  
  render(){
    const displayText = this.state.fetching ? "none" : "block"

    return (
      <div>
        {
          this.state.fetching
          &&
          <div style={{position: "fixed", top: "50%", left: "50%"}}>
          <Spinner/>
          </div>
        }
        
        {this.state.selectionRange && <p ref={ref => this.fooRef = ref} data-tip='tooltip' style={{position: "fixed", top: this.state.selectionRange.coords.top + 10, left: this.state.selectionRange.coords.left}}></p>}
        <ReactTooltip clickable={true} place="top">
          {/* TODO: should become its own comonent */}
          <div style={{overflow: "scroll", "maxWidth": "300px"}}>
            {(this.state.selectionRange.text && this.state.selectionRange.text.split(" ").length === 1) && 
            <div>
            <p>
              {this.state.dictionary === "whitakerswords" ? <iframe title="whitakerswords" src={"http://archives.nd.edu/cgi-bin/wordz.pl?keyword=" + this.state.selectedText }></iframe>
              : <iframe title="logeion" src={"https://logeion.uchicago.edu/" + this.state.selectedText }></iframe>}
            </p>
            </div>
            }
            {this.state.selectionRange &&
            <Nav>
              <Nav.Link title={this.state.selectionRange.wordRange.start + "-" +this.state.selectionRange.wordRange.end} onClick={() => {this.handleOnClickComment(false)}}><FaInfo/></Nav.Link>
              <Nav.Link onClick={() => {this.handleOnClickComment(false)}}><FaComments/></Nav.Link>
              <Nav.Link onClick={() => {this.handleOnClickComment(true)}}><FaEdit/></Nav.Link>
              {(this.state.selectionRange.text && this.state.selectionRange.text.split(" ").length === 1) && 
              <span>
              {(this.state.dictionary === 'whitakerswords') ? 
              <Nav.Link title="select logeion" onClick={()=>this.handleDictionaryChange("logeion")}><FaBook/> L</Nav.Link>
              : 
              <Nav.Link title="select whitaker's words" onClick={()=>this.handleDictionaryChange("whitakerswords")}><FaBook/> W</Nav.Link>}
              </span>
              }
            </Nav>
            }
          </div>
        </ReactTooltip>
        <div id="text" style={{display: displayText}}></div>
      </div>

    );
  }
}

export default Text;
