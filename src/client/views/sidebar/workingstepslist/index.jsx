import React from 'react';
import request from 'superagent';

export default class WorkingstepList extends React.Component {
  constructor(props){
    //Create the constructor for the component
    super(props);
    this.state = {workingsteps: []};

    this.renderNode = this.renderNode.bind(this);
  }

  getNodeIcon(node,num){
      if (node.type == "workplan"){
        return <span className='icon-letter'>W</span>;
      }else if (node.type == "selective"){
        return <span className='icon-letter'>S</span>;
      }else{
        return <span className='icon-letter'>{num}</span>;;
      }
  }

  onObjectTreeNodeClick(node, self){
        let url = "/v3/nc/state/ws/" + node["id"];
        request
          .get(url)
          .end(function(err, res){
            //
          });
    }

  renderNode(node){
      let cName = 'node';
        if(node.id == this.props.ws) cName= 'node running-node';
      return <ol
          id={node.id}
          className={cName}
          onClick={this.onObjectTreeNodeClick.bind(this, node)}
          onMouseDown={function(e){e.stopPropagation()}}
          style={{"paddingLeft" : "5px"}}
          key={node.id} >
          {node.icon}
          <span className="textbox">{node.name}</span>
      </ol>;
  }

  componentDidMount(){
      let url = "/v3/nc/workplan/";
      let resCb = function(err,res){ //Callback function for response
            if(!err && res.ok){
              // Node preprocessing
              let nodes = [];
              let nodeCheck = (node)=>{
                node.icon = this.getNodeIcon(node,nodes.length+1);
                if(node.children) node.children.forEach(nodeCheck);
                  if(node.type === "workingstep" && node.enabled)
                    nodes.push(node);
              }
              let json = JSON.parse(res.text);
              nodeCheck(json);
              this.setState({workingsteps: nodes});
            }
      }
      resCb = resCb.bind(this); //Needs to bind this in order to have correct this
      request
        .get(url)
        .end(resCb);
  }

  render(){
    return (
      <div className='m-tree'>
        {this.state.workingsteps.map((workingstep, i) => {
          return <div className='m-node' key={i}>
            {this.renderNode(workingstep)}
          </div>;
        })}
      </div>
    );
  }
}

WorkingstepList.propTypes = {cbMode: React.PropTypes.func.isRequired, cbTree: React.PropTypes.func.isRequired, ws: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]).isRequired};