import './App.css';
import React, { useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

const createRndGraph = (vert, edgeProb) => {
  console.log(vert, edgeProb);
 const g = new Array(vert);

 for (let i = 0; i < vert; i++) {
  g[i] = new Array(vert);
 }

 for (let i = 0; i < vert; i++) {
   console.log(i, g);
   for (let j = i + 1; j < vert; j++) {
     const edge = Number(Math.random() < edgeProb);
     if (edge && j > i) {
      const w = Math.round(Math.random() * 20);
      g[i][j] = w;
      g[j][i] = w;
     } else {
      g[i][j] = 0;
      g[j][i] = 0;
     }
   }
   g[i][i] = 0;
 }

 return g;
}

const createNode = (vert, x, y) => ({
  "data": {
    "id": `n${vert}`,
    "weight": 53,
    "label": vert.toString()
  },
  "position": {
    "x": x,
    "y": y
  },
  "group": "nodes",
})

const createEdge = (vert1, vert2, weight) => ({
  "data": {
    "id": `en${vert1}n${vert2}`,
    "weight": weight,
    "mycust": weight,
    "source": `n${vert1}`,
    "target": `n${vert2}`,
  },
  "selected": false,
  "selectable": false,
  "group": "edges",
})


const createGraphViz = (g) => {
  const elements = [];
  const vert = g.length;
  
  for (let i = 0; i < vert; i++) {
    elements.push(createNode(i, Math.random() * 500, Math.random() * 500));
  }

  for (let i = 0; i < vert; i++) {
    for (let j = i+1; j < vert; j++) {
      if (g[i][j]) {
        elements.push(createEdge(i, j, g[i][j]));
      }
    }
  }

  return elements;
}

const TableRow = ({rowNum, tableRow}) => {
  console.log({rowNum, tableRow});
  return (
    <tr>
      <th key={0}>n{rowNum}</th>
      {tableRow.map((e, i) => <td key={i+1}>{e}</td>)}
    </tr>
  )
}

const HeaderTableRow = ({ vert }) => {
  const cells = new Array(vert);
  for (let i = 0; i< vert; i++) {
    cells.push(<th key={i+1}>n{i}</th>);
  }

  return (
    <tr>
      <th key={0}></th>
      {cells}
    </tr>
  )
}

const GraphTable = ({graph}) => {
  const nodes = new Array(graph.length);
  
  for (let i = 0; i < graph.length; i++) {
    nodes.push(i);
  }

  console.log('nodes', nodes)

  return (
    <table>
      <thead>
        <HeaderTableRow vert={graph.length} />
      </thead>
      <tbody>
        {
          nodes.map((i) => <TableRow key={i} rowNum={i} tableRow={graph[i]} />)
        }
      </tbody>
    </table>
  )
}

const kruskall = (graph) => {
  let g = []; 
  let cost = 0;
  let mst = []; // minimum spanning tree минимальное остовное дерево
  let treeIds = [];

  const n = graph.length;

  for (let i = 0; i < n; i++) {
    for (let j = i+1; j < n; j++) {
      if (graph[i][j]) {
        g.push({ 
          weight: graph[i][j],
          source: i,
          target: j,
        });
      }
    }
  }

  g.sort((a, b) => a.weight - b.weight);
  
  for (let i = 0; i < n; i++){
    treeIds[i] = i;
  }
    
  for (let i = 0; i < g.length; i++)
  {
    const { source, target, weight } = g[i];
    if (treeIds[source] !== treeIds[target])
    {
      cost += weight;
      mst.push(`en${source}n${target}`);
      let oldTreeId = treeIds[source];
      let newTreeId = treeIds[target];
      for (let j = 0; j < n; j++) {
        if (treeIds[j] === oldTreeId) {
          treeIds[j] = newTreeId;
        }
      }
    }
  }

  return { cost, edges: mst }
}

function App() {

  const [ numNodes, setNumNodes ] = useState(5);
  const [ prob, setProb ] = useState(50);

  const nn = Number(numNodes);
  const pp = Number(prob);

  const g = createRndGraph(Math.max(nn, 2), pp > 20 && pp < 100 ? pp / 100 : 0.5);

  const { edges, cost } = kruskall(g);
  const viz = createGraphViz(g);

  const kSet = new Set(edges);
  const numEdges = viz.filter(e => e.group === 'edges').length;

  viz.forEach((el) => {
    console.log(el.data.id);
    if (kSet.has(el.data.id)) {
      el.selected = true
    }
  });

  console.log(viz);
  return (
    <>
    <h1>Алгоритм крускалла</h1>
    <CytoscapeComponent cy={ cy => {cy.elements().remove(); cy.add( viz );}} elements={[]} stylesheet={ [
        {
          selector: 'node',
          style: {
            'height': 20,
            'width': 20,
            'label': 'data(id)',
            'background-color': '#18e018'
          }
        },

        {
          selector: 'edge',
          style: {
            'curve-style': 'haystack',
            'haystack-radius': 0,
            'width': 5,
            'label': 'data(weight)',
            'opacity': 0.7,
          }
        }
      ]} style={ { width: '600px', height: '600px', border: '1px solid black' } } />
    <div>
      <input type='number' value={numNodes} onChange={e => e.target.value >= 2 && setNumNodes(e.target.value)} />
      <input type='range' min={20} max={100} step={5} value={prob} onChange={e => setProb(e.target.value)} />
      <GraphTable graph={g} />
      <p>Минимальный остов: {cost}</p>
      <p>Количество вершин: {nn}</p>
      <p>Количество связей: {numEdges}</p>
      <p>Количество связей в остове: {edges.length}</p>
      <p>Вершины  входящие в остов: {edges.sort().join(',')}</p>
      <p>Вершины  входящие в остов: { viz.filter(e => e.group === 'edges').map(e => e.data.id).sort().join(',')}</p>
    </div>
    </>
  );
}

export default App;
