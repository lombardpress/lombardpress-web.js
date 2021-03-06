import React from 'react';
import Container from 'react-bootstrap/Container';
import Print from "./Print"


import Window from "./Window"
import TextNavBar from "./TextNavBar"
import Text from "./Text"
import VersionChain from "./VersionChain"
import {runQuery, scrollToParagraph} from './utils'

import {basicInfoQuery, itemTranscriptionInfoQuery} from './Queries'


class TextWrapper extends React.Component {
  constructor(props){
    super(props)
    this.mount = false
    this.openWindow = this.openWindow.bind(this)
    this.setFocus = this.setFocus.bind(this)
    this.setFocus2 = this.setFocus2.bind(this)
    this.handleTabChange = this.handleTabChange.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleMinimize = this.handleMinimize.bind(this)
    this.handleMaximize = this.handleMaximize.bind(this)
    this.handleMiddlize = this.handleMiddlize.bind(this)
    this.handleSwitchWindow = this.handleSwitchWindow.bind(this)
    this.handleDuplicateWindow = this.handleDuplicateWindow.bind(this)
    this.handleSurfaceFocusChange = this.handleSurfaceFocusChange.bind(this)
    this.handleLineFocusChange = this.handleLineFocusChange.bind(this)
    this.handleToggleTextLinesView = this.handleToggleTextLinesView.bind(this)
    this.handleChangeManifestation = this.handleChangeManifestation.bind(this)
    this.handleTextPreviewFocusChange = this.handleTextPreviewFocusChange.bind(this)
    this.handleTogglePdfView = this.handleTogglePdfView.bind(this)
    this.handleUpdateSelectionRange = this.handleUpdateSelectionRange.bind(this)
    this.state = {
      doc: "",
      focus: "",
      //focusRelatedExpressions: "",
      mtFocus: "",
      itemFocus: "",
      surfaceid: "",
      lineFocusId: "",
      textPreviewObjects: [],
      pdfView: false,
      selectionRange: undefined, // should be undefined or object
      windows: {
        window1: {
          windowId: "window1",
          open: true,
          windowLoad: "citation",
          position: "sideWindow",
          openWidthHeight: "middle",
          annotationsDisplay: "paragraph",
          defaultManifestationSlug: ""
        },
        window2: {
          windowId: "window2",
          open: false,
          windowLoad: "citation",
          position: "bottomWindow",
          openWidthHeight: "middle",
          annotationsDisplay: "paragraph",
          defaultManifestationSlug: ""
        }
      }
    }
  }
  handleTogglePdfView(){
    this.setState((prevState) => {
        return {
          pdfView: !prevState.pdfView
        }
    })
  }
  handleToggleTextLinesView(windowId, value){
    this.setState((prevState) => {
      const windows = prevState.windows
      windows[windowId].annotationsDisplay = value
      return {windows: windows}
    })
  }
  handleChangeManifestation(windowId, manifestationSlug){
    this.setState((prevState) => {
      const windows = prevState.windows
      windows[windowId].defaultManifestationSlug = manifestationSlug
      return {windows: windows}
    })
  }

  openWindow(id, windowLoad){
    if (!this.state.windows[id].open || this.state.windows[id].windowLoad !== windowLoad){
      this.setState((prevState) => {
        const windows = prevState.windows
        windows[id].open = true
        if (windowLoad){
          windows[id].windowLoad = windowLoad
        }
        return {
          windows: windows,
        }
      })
    }
  }
  handleClose(windowId){
    this.setState((prevState) => {
      const windows = prevState.windows
      windows[windowId].open = false
      return {windows: windows}

    })
    //scroll is supposed to re-align text scroll to focused paragraph after side bar close.
    //but it is not quite working
    scrollToParagraph(this.state.blockFocus, true)

  }
  
  handleMinimize(windowId){
    this.setState((prevState) => {
      const windows = prevState.windows
      windows[windowId].openWidthHeight = "minimum"
      return {windows: windows}

    })
  }
  handleMaximize(windowId){
    this.setState((prevState) => {
      const windows = prevState.windows
      windows[windowId].openWidthHeight = "maximum"
      return {windows: windows}

    })
  }
  handleMiddlize(windowId){
    this.setState((prevState) => {
      const windows = prevState.windows
      windows[windowId].openWidthHeight = "middle"
      return {windows: windows}

    })
  }
  
  /**
   * @description update state with selectionRangeObject
   * @param {object} selectionRange
   */
  handleUpdateSelectionRange(selectionRange){
    const s = selectionRange
    this.setState({selectionRange: s})
  }
  handleSwitchWindow(windowId, windowType){
    this.setState((prevState) => {
      const windows = prevState.windows
      if (windows[windowId].position === "sideWindow"){
        windows[windowId].position = "bottomWindow"
        // these conditionals control whether an already existing window will be closed when the other is moved
        // while commented they allow window1 and window2 to stack on top of each other

        // if (windowId === "window1"){
        //   windows["window2"].open = false
        // }
        // else if ((windowId === "window2")){
        //   windows["window1"].open = false
        // }
      }
      else if (windows[windowId].position === "bottomWindow"){
        windows[windowId].position = "sideWindow"
        // these conditionals control whether an already existing window will be closed when the other is moved
        // while commented they allow window1 and window2 to stack on top of each other

        // if (windowId === "window1"){
        //   windows["window2"].open = false
        // }
        // else if ((windowId === "window2")){
        //   windows["window1"].open = false
        // }
      }
      return {windows: windows}

    })
  }
  handleDuplicateWindow(windowId, windowType){
    this.setState((prevState) => {
      const windows = prevState.windows
      const altWindowId = windowId === "window1" ? "window2" : "window1"
      if (windows[windowId].position === "sideWindow"){
        windows[altWindowId].position = "bottomWindow"
        windows[altWindowId].open = true
      }
      else if (windows[windowId].position === "bottomWindow"){
        windows[altWindowId].position = "sideWindow"
        windows[altWindowId].open = true
      }
      return {windows: windows}
    })
  }
  handleTabChange(windowLoad, windowId){

    this.setState((prevState) => {
      const windows = prevState.windows
      windows[windowId].windowLoad = windowLoad
      return {windows: windows}

    })

  }

  handleSurfaceFocusChange(surfaceid){
    this.setState({surfaceid: surfaceid})
  }
  handleLineFocusChange(lineFocusId){
    this.setState({lineFocusId: lineFocusId})
  }
  /**
   * @description a function that handle events on main text and passes relevant information to TextPreviewWrapper Component
   * 
   * @param {Object[]} targetObjects - an array of objects 
   * @param {string} id - the target id
   * @param {string} range - the word range (e.g. 1-4), delimited by a dash, corresponding to the target
   */
  handleTextPreviewFocusChange(targetObjects){
    //check to see if textPreviewResourceId carries more than one id
    //if so split by white space 
    this.setState({textPreviewObjects: targetObjects})
  }
  //TODO
  //These two function should be refactored into one
  setFocus(id){
    const range = id.split("@")[1] ? "@" + id.split("@")[1] : ""
    id = id.split("@")[0];
    const fullid = id.includes("http") ? id + this.state.mtFocus + range : "http://scta.info/resource/" + id + this.state.mtFocus + range;
    this.props.handleUpdateUrlResource(fullid)
  }
  setFocus2(newid){
    this.props.handleUpdateUrlResource(newid)
  }
  //END TODO


  retrieveFocusInfo(id){
    const fullid = id.includes("http") ? id : "http://scta.info/resource/" + id
    // get info
    const info = runQuery(basicInfoQuery(fullid))
    //arrange info and set it to state

    this.arrangeFocusInfo(info, fullid)
    // get related expressions info
    // removed these second calls and embed the query in arrange focus info to keep information in sync.
    // TODO remove below three lines
    //const relatedExpressions = runQuery(getRelatedExpressions(fullid))
    //arrange info and set it to state
    //this.arrangeFocusRelatedInfo(relatedExpressions)

    //scrollToParagraph(shortid, true)

  }

  arrangeFocusInfo(info, resourceid){
      info.then((d) => {
        const bindings = d.data.results.bindings[0]
        const manifestations = d.data.results.bindings.map((b) => {
          return {
            manifestation: b.manifestation.value,
            manifestationTitle: b.manifestationTitle.value,
            transcription: b.manifestationCTranscription ? b.manifestationCTranscription.value : ""
          }
        })
        // TODO the need for this 2nd query and async call might
        // be able to be removed using a construct query
        // see example pattern in articles collection
        //const relatedExpressions = runQuery(getRelatedExpressions(resourceid))
        // relatedExpressions.then((d) => {
        //   const bindings2 = d.data.results.bindings
        //   const relatedExpressions = bindings2.map((r) => {
        //       return {
        //         resourceid: r.isRelatedTo.value,
        //         relationLabel: r.label.value,
        //         referringResource: r.element ? r.element.value : "",
        //         author: r.author ? r.author.value : "",
        //         authorTitle: r.authorTitle ? r.authorTitle.value : "",
        //         longTitle: r.longTitle ? r.longTitle.value : ""
        //       }
        //     });

          if (this.mount && bindings){
            this.setState({
              focus: {
                resourceid: resourceid,
                title: bindings.title.value,
                longTitle: bindings.longTitle ? bindings.longTitle.value : "",
                author: bindings.author ? bindings.author.value : "",
                authorTitle: bindings.authorTitle ? bindings.authorTitle.value : "",
                structureType: bindings.structureType.value,
                inbox: bindings.inbox.value,
                next: bindings.next ? bindings.next.value : "",
                previous: bindings.previous ? bindings.previous.value : "",
                parent: bindings.parent ? bindings.parent.value : "",
                cdoc: bindings.cdoc ? bindings.cdoc.value : "",
                cxml: bindings.cxml ? bindings.cxml.value : "",
                topLevel: bindings.topLevelExpression.value,
                cmanifestation: bindings.cmanifestation.value,
                ctranscription: bindings.ctranscription ? bindings.ctranscription.value : "",
                manifestations: manifestations,
                //relatedExpressions: relatedExpressions
              }
            });
          }
        //})
      });
    }
  // embeded this within arrang focus info, so that information remains in sync
  // TODO remove this
    // arrangeFocusRelatedInfo(relatedInfo){
    //     relatedInfo.then((d) => {
    //       console.log("new data", d)
    //       const bindings = d.data.results.bindings
    //       const relatedExpressions = bindings.map((r) => {
    //           return {
    //             resourceid: r.isRelatedTo.value,
    //             relationLabel: r.label.value
    //           }
    //         });
    //     if (this.mount){
    //       this.setState({
    //         focusRelatedExpressions: relatedExpressions
    //       });
    //       }
    //     });
    //   }
    setItemFocus(id){
      const fullid = id.includes("http") ? id : "http://scta.info/resource/" + id
      // get info
      const info = runQuery(itemTranscriptionInfoQuery(fullid))
      this.arrangeItemFocusInfo(info)
    }
    arrangeItemFocusInfo(itemFocusInfo){
        itemFocusInfo.then((d) => {
          const bindings = d.data.results.bindings[0]
          if (this.mount){
            this.setState({
              itemFocus: {
                title: bindings.title.value,
                manifestation: bindings.manifestation.value,
                expression: bindings.expression.value,
                doc: bindings.doc.value,
                xml: bindings.xml.value,
                next: bindings.next ? bindings.next.value : "",
                previous: bindings.previous ? bindings.previous.value : "",
                inbox: bindings.inbox.value,
                topLevel: bindings.topLevelExpression.value,
                transcriptionid: bindings.t.value
              }
            });
          }
        });
      }

  componentDidMount(){
    this.mount = true
    //transcriptionid should be required Prop
    //conditional here to reinfurce that rule
    if (this.props.transcriptionid){
      this.setItemFocus(this.props.transcriptionid)
      //TODO: splitting strings for this information is not ideal.
      //info should be part of original query
      const mFocus = this.props.transcriptionid.split("/resource/")[1].split("/")[1]
      const tFocus = this.props.transcriptionid.split("/resource/")[1].split("/")[2]
      const selectionRange = this.props.tokenRange ? {
        wordRange: this.props.tokenRange,
        selectedElementTargetId: this.props.blockDivFocus && this.props.blockDivFocus.split("/resource/")[1],
      } : {}
      this.setState(
        {mtFocus: "/" + mFocus + "/" + tFocus, 
        selectionRange: selectionRange
      })

      if (this.props.blockDivFocus){
        this.retrieveFocusInfo(this.props.blockDivFocus)
      }
    }
  }
  //TODO: delete; after newly added replacement componentDidUpdate continues to work reliably
  // UNSAFE_componentWillReceiveProps(newProps){
  //   //Keep testing, but it seems like this look up only needs to fire, when the transcription id prop changes
  //   // not when other props changes.
  //   if (newProps.transcriptionid !== this.props.transcriptionid){
  //     this.setItemFocus(newProps.transcriptionid)
  //     const mFocus = newProps.transcriptionid.split("/resource/")[1].split("/")[1]
  //     const tFocus = newProps.transcriptionid.split("/resource/")[1].split("/")[2]
  //     //clear or set parts of state when new transcription file is loaded
  //     this.setState((prevState) => {
  //       const windows = prevState.windows
  //       windows["window1"].defaultManifestationSlug = ""
  //       windows["window2"].defaultManifestationSlug = ""
  //       return {
  //         mtFocus: "/" + mFocus + "/" + tFocus,
  //         windows: windows
  //       }
  //     })
  //   }
    componentDidUpdate(prevProps){
      //Keep testing, but it seems like this look up only needs to fire, when the transcription id prop changes
      // not when other props changes.
      if (this.props.transcriptionid !== prevProps.transcriptionid){
        this.setItemFocus(this.props.transcriptionid)
        const mFocus = this.props.transcriptionid.split("/resource/")[1].split("/")[1]
        const tFocus = this.props.transcriptionid.split("/resource/")[1].split("/")[2]
        //clear or set parts of state when new transcription file is loaded
        this.setState((prevState) => {
          const windows = prevState.windows
          windows["window1"].defaultManifestationSlug = ""
          windows["window2"].defaultManifestationSlug = ""
          const selectionRange = this.props.tokenRange ? {
            ...prevState.selectionRange, 
            wordRange: this.props.tokenRange,
            selectedElementTargetId: this.props.blockDivFocus && this.props.blockDivFocus.split("/resource/")[1],
          } : {}
          return {
            mtFocus: "/" + mFocus + "/" + tFocus,
            selectionRange: selectionRange,
            windows: windows
          }
        })
      }
      //TODO: seems a little dangerous to have these two different setState/async calls 
      //if one depends on the other, this is a good place for things to get out of sync
      if (this.props.blockDivFocus !== prevProps.blockDivFocus){
        if (!this.props.blockDivFocus){
          this.setState(
            {
              focus: "",
              selectionRange: ""
          });
        }
        else {
          this.setState((prevState) => {
            const selectionRange = this.props.tokenRange ? {
              ...prevState.selectionRange, 
              wordRange: this.props.tokenRange,
              selectedElementTargetId: this.props.blockDivFocus && this.props.blockDivFocus.split("/resource/")[1],
            } : {}
            return({
            selectionRange: selectionRange
            })  
          })
          this.retrieveFocusInfo(this.props.blockDivFocus,)
        }
      }
      if (this.props.tokenRange !== prevProps.tokenRange){
        this.setState((prevState)=>{
          const selectionRange = this.props.tokenRange ? {
            ...prevState.selectionRange, 
            wordRange: this.props.tokenRange,
            selectedElementTargetId: this.props.blockDivFocus && this.props.blockDivFocus.split("/resource/")[1],
          } : {}
          return({
          selectionRange: selectionRange
        })
        })
      }




  }
  componentWillUnmount(){
    this.mount = false
  }
  render(){
    const displayWindows = () => {
      const windows = Object.keys(this.state.windows).map((key) => {
        if (this.state.windows[key].open){
          return (<Window
              key={key}
              handleClose={this.handleClose}
              handleMinimize={this.handleMinimize}
              handleMaximize={this.handleMaximize}
              handleMiddlize={this.handleMiddlize}
              handleTabChange={this.handleTabChange}
              handleBlockFocusChange={this.setFocus}
              handleFocusChange={this.setFocus2}
              handleSurfaceFocusChange={this.handleSurfaceFocusChange}
              handleSwitchWindow={this.handleSwitchWindow}
              handleDuplicateWindow={this.handleDuplicateWindow}
              resourceid={this.state.focus ? this.state.focus.resourceid : this.props.resourceid}
              windowType={this.state.windows[key].position}
              windowId={this.state.windows[key].windowId}
              windowLoad={this.state.windows[key].windowLoad}
              openWidthHeight={this.state.windows[key].openWidthHeight}
              surfaceid={this.state.surfaceid}
              lineFocusId={this.state.lineFocusId}
              info={this.state.focus}
              itemFocus={this.state.itemFocus}
              topLevel={this.state.itemFocus.topLevel}
              altWindowState={this.state.windows[key].windowId === "window1" ? this.state.windows["window2"].open : this.state.windows["window1"].open}
              mtFocus={this.state.mtFocus}
              handleToggleTextLinesView={this.handleToggleTextLinesView}
              annotationsDisplay={this.state.windows[key].annotationsDisplay}
              handleChangeManifestation={this.handleChangeManifestation}
              defaultManifestationSlug={this.state.windows[key].defaultManifestationSlug}
              textPreviewObjects={this.state.textPreviewObjects}
              handleTextPreviewFocusChange={this.handleTextPreviewFocusChange}
              handleLineFocusChange={this.handleLineFocusChange}
              selectionRange={this.state.selectionRange}
              />
            )
          }
          else{
            return null
          }
        })
        return windows
      }
    
    const textClassNames = ["lbp-text"]
    this.state.windows.window1.open && this.state.windows.window1.openWidthHeight === "middle" ? textClassNames.push("skinnyText") : textClassNames.push("fullText");
    this.state.windows.window2.open && textClassNames.push("longText");
    this.state.pdfView ? textClassNames.push("hidden"): textClassNames.push("showing");
    

    return (
      <div>
        {this.state.itemFocus &&
          <VersionChain transcriptionid={this.state.itemFocus.transcriptionid} handleFocusChange={this.setFocus2}/>
        }
        { this.state.pdfView && <Print url={this.state.itemFocus.doc}/>}
        {
          // Text Container and Text are always loaded to avoid unnecessary re-mounting
          // textHide variable is used to hide or show textContainer depending on whether this.statePdfView is true or false
        }
        <Container className={textClassNames.join(" ")}>

        {this.state.itemFocus &&
          <Text
            doc={this.state.itemFocus.doc}
            topLevel={this.state.itemFocus.topLevel}
            setFocus={this.setFocus}
            handleSurfaceFocusChange={this.handleSurfaceFocusChange}
            handleLineFocusChange={this.handleLineFocusChange}
            openWindow={this.openWindow}
            // NOTE: using props instead of state; seems better, but needs full documentation
            // NOTE: itemid is shortid of item: TODO: needs documentation; or better, refactoring!
            // TODO: when scrollTo id type is consistent, remove id checker in didMount and didUpdate of Text component
            scrollTo={this.props.blockDivFocus ? this.props.blockDivFocus : this.props.itemid}
            handleTextPreviewFocusChange={this.handleTextPreviewFocusChange}
            handleUpdateSelectionRange={this.handleUpdateSelectionRange}
            selectionRange={this.state.selectionRange}
            />
          }
        </Container>

        <TextNavBar
          next={this.state.itemFocus && this.state.itemFocus.next}
          previous={this.state.itemFocus && this.state.itemFocus.previous}
          topLevel={this.state.itemFocus && this.state.itemFocus.topLevel}
          handleClose={this.handleClose}
          pdfView={this.state.pdfView}
          handleTogglePdfView={this.handleTogglePdfView}
          mtFocus={this.state.mtFocus}
        />
        <div>
        {
        // <TextNavBar
        // next={this.state.items[this.state.itemFocus] && this.state.items[this.state.itemFocus].next}
        // previous={this.state.items[this.state.itemFocus] && this.state.items[this.state.itemFocus].previous}
        // topLevel={this.state.items[this.state.itemFocus] && this.state.items[this.state.itemFocus].topLevel}
        // handleClose={this.handleClose}
        // />
        }
        {!this.state.pdfView && displayWindows()}
        </div>
      </div>
    );
  }
}
export default TextWrapper;
