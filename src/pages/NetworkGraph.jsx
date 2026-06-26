import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function NetworkGraph() {
  const [data, setData] = useState({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)
  const fgRef = useRef()

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return data.nodes
      .filter(n => n.group === 'Colony' && n.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5)
  }, [searchQuery, data.nodes])

  function handleSelectSearchResult(node) {
    setSearchQuery('')
    setIsSearchFocused(false)
    setSelectedNode(node)
    
    // Pin the node in place so physics engine doesn't push it away while expanding!
    if (node.x !== undefined && node.y !== undefined) {
      setData(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === node.id ? { ...n, fx: n.x, fy: n.y } : n)
      }))
    }
    
    if (!node.expanded) {
      expandColony(node)
    }

    if (fgRef.current && node.x !== undefined) {
      fgRef.current.centerAt(node.x, node.y, 1000)
      fgRef.current.zoom(8, 2000)
    }
  }

  const [expandedColonies, setExpandedColonies] = useState(new Set())
  const [isExpanding, setIsExpanding] = useState(false)

  const computeNeighbors = useCallback((nodes, links) => {
    nodes.forEach(node => {
      node.neighbors = []
      node.links = []
    })
    links.forEach(link => {
      const aId = typeof link.source === 'object' ? link.source.id : link.source
      const bId = typeof link.target === 'object' ? link.target.id : link.target
      
      const a = nodes.find(n => n.id === aId)
      const b = nodes.find(n => n.id === bId)
      
      if (a && b) {
        a.neighbors.push(b)
        b.neighbors.push(a)
        a.links.push(link)
        b.links.push(link)
      }
    })
    return { nodes, links }
  }, [])

  useEffect(() => {
    document.title = 'TNR Tracker — Network Graph'
    fetchInitialGraphData()
  }, [])

  async function fetchInitialGraphData() {
    setLoading(true)
    
    // Only fetch Colonies and Profiles initially
    const [coloniesRes, profilesRes] = await Promise.all([
      supabase.from('colonies').select('*'),
      supabase.from('profiles').select('id, name')
    ])

    const colonies = coloniesRes.data || []
    const profiles = profilesRes.data || []

    const nodes = []
    const links = []

    profiles.forEach(p => {
      nodes.push({ id: `profile-${p.id}`, name: p.name || 'Volunteer', group: 'Volunteer', val: 15, color: '#3b82f6' })
    })

    colonies.forEach(c => {
      nodes.push({ id: `colony-${c.id}`, rawId: c.id, name: c.name, group: 'Colony', val: 20, color: '#10b981', expanded: false })
    })

    setData(computeNeighbors(nodes, links))
    setLoading(false)
  }

  async function expandColony(colonyNode) {
    if (expandedColonies.has(colonyNode.rawId) || isExpanding) return
    setIsExpanding(true)
    
    try {
      const [catsRes, trapsRes] = await Promise.all([
        supabase.from('cats').select('*').eq('colony_id', colonyNode.rawId),
        supabase.from('traps').select('*').eq('colony_id', colonyNode.rawId)
      ])

      const cats = catsRes.data || []
      const traps = trapsRes.data || []

      setData(prevData => {
        const newNodes = [...prevData.nodes]
        const newLinks = [...prevData.links]

        cats.forEach(c => {
          if (!newNodes.find(n => n.id === `cat-${c.id}`)) {
            newNodes.push({ id: `cat-${c.id}`, name: c.name || 'Unnamed Cat', group: 'Cat', val: 5, color: c.neutered ? '#34d399' : '#fbbf24' })
            newLinks.push({ source: `cat-${c.id}`, target: `colony-${c.colony_id}`, color: '#e5e7eb' })
            if (c.logged_by && newNodes.find(n => n.id === `profile-${c.logged_by}`)) {
              newLinks.push({ source: `profile-${c.logged_by}`, target: `cat-${c.id}`, color: '#bfdbfe', dashed: true })
            }
          }
        })

        traps.forEach(t => {
          if (!newNodes.find(n => n.id === `trap-${t.id}`)) {
            newNodes.push({ id: `trap-${t.id}`, name: `Trap (${t.status})`, group: 'Trap', val: 8, color: '#ef4444' })
            newLinks.push({ source: `trap-${t.id}`, target: `colony-${t.colony_id}`, color: '#fca5a5' })
            if (t.assigned_to && newNodes.find(n => n.id === `profile-${t.assigned_to}`)) {
              newLinks.push({ source: `profile-${t.assigned_to}`, target: `trap-${t.id}`, color: '#93c5fd' })
            }
          }
        })

        const updatedNodes = newNodes.map(n => 
          n.id === colonyNode.id ? { ...n, expanded: true } : n
        )

        return computeNeighbors(updatedNodes, newLinks)
      })

      setExpandedColonies(prev => new Set(prev).add(colonyNode.rawId))
      
    } catch (e) {
      toast.error('Failed to load full graph data')
    } finally {
      setIsExpanding(false)
    }
  }

  const [hoverNode, setHoverNode] = useState(null)
  const highlightNodes = useMemo(() => {
    const set = new Set()
    if (hoverNode) {
      set.add(hoverNode)
      hoverNode.neighbors?.forEach(neighbor => set.add(neighbor))
    }
    return set
  }, [hoverNode])

  const highlightLinks = useMemo(() => {
    const set = new Set()
    if (hoverNode) {
      hoverNode.links?.forEach(link => set.add(link))
    }
    return set
  }, [hoverNode])

  useEffect(() => {
    if (!loading && fgRef.current) {
      setTimeout(() => {
        fgRef.current.zoomToFit(1000, 50)
      }, 1500)
    }
  }, [loading])

  const [selectedNode, setSelectedNode] = useState(null)

  return (
    <div className="h-full w-full bg-white flex flex-col relative overflow-hidden" 
         style={{
           backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)`,
           backgroundSize: '40px 40px'
         }}>
      
      {/* Top Banner */}
      <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl p-4 rounded-2xl flex items-center justify-between z-10 pointer-events-none">
        <div>
          <h1 className="text-xl font-bold text-gray-900 pointer-events-auto flex items-center gap-2">
            <span className="animate-pulse">🟢</span> TNR Command Center
          </h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide uppercase mt-1">Hierarchical Graph Ecosystem</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-96 pointer-events-auto mx-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              🔍
            </span>
            <input 
              type="text" 
              placeholder="Search colonies by name or number..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm transition-all shadow-sm"
            />
          </div>
          
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden z-50">
              {searchResults.map(node => (
                <button
                  key={node.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSearchResult(node);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-emerald-50 focus:bg-emerald-50 transition-colors border-b border-gray-100 last:border-0 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-bold text-gray-900">{node.name}</span>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold ${node.expanded ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {node.expanded ? 'EXPANDED' : 'CLICK TO EXPAND'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-gray-600 pointer-events-auto bg-gray-50/80 p-2 rounded-lg border border-gray-200">
          {isExpanding && <span className="text-emerald-500 animate-pulse mr-2">Fetching Local Data...</span>}
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> Colony</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div> Volunteer</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-300 shadow-[0_0_8px_#6ee7b7]"></div> Managed Cat</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></div> Intact Cat</span>
          <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div> Trap</span>
        </div>
      </div>
      
      {/* Sliding Data Panel */}
      <div className={`absolute top-28 right-4 bottom-4 w-80 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl z-20 transition-all duration-300 transform ${selectedNode ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
        {selectedNode && (
          <div className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4 border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">{selectedNode.group}</span>
                <h2 className="text-2xl font-black text-gray-900 mt-1">{selectedNode.name}</h2>
                {selectedNode.group === 'Colony' && !selectedNode.expanded && (
                  <span className="inline-block mt-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">CLICK TO EXPAND DATA</span>
                )}
              </div>
              <button onClick={() => setSelectedNode(null)} aria-label="Close panel" className="text-gray-400 hover:text-gray-900 p-1">✕</button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Local Connections</p>
                <p className="text-xl font-bold text-gray-900">{selectedNode.neighbors?.length || 0}</p>
              </div>
              
              {selectedNode.neighbors?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Connected Entities</p>
                  <ul className="space-y-2 overflow-y-auto max-h-[40vh] pr-2">
                    {selectedNode.neighbors.map((n, i) => (
                      <li key={i} className="flex items-center justify-between text-sm p-2 rounded-md bg-white border border-gray-200 text-gray-700">
                        <span className="truncate max-w-[150px]">{n.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase whitespace-nowrap">{n.group}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 w-full h-full cursor-move">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xl font-bold text-emerald-500 animate-pulse font-mono">INITIALIZING HIERARCHICAL GRAPH... 🕸️</div>
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            graphData={data}
            nodeLabel="name"
            nodeRelSize={1}
            d3AlphaDecay={0.05}
            d3VelocityDecay={0.2}
            cooldownTicks={100}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.name
              const fontSize = 12/globalScale
              ctx.font = `${fontSize}px Sans-Serif`
              
              const isHovered = highlightNodes.size > 0 && highlightNodes.has(node)
              const isFaded = highlightNodes.size > 0 && !highlightNodes.has(node)

              // Draw pulsing ring for unexpanded colonies
              if (node.group === 'Colony' && !node.expanded && !isFaded) {
                const time = Date.now() / 300
                const pulse = Math.abs(Math.sin(time)) * 0.4
                ctx.beginPath()
                ctx.arc(node.x, node.y, (node.val * 0.6) + 2 + pulse * 4, 0, 2 * Math.PI, false)
                ctx.fillStyle = `rgba(16, 185, 129, ${0.3 - pulse * 0.2})`
                ctx.fill()
              }

              // Draw Node Circle Background
              ctx.beginPath()
              ctx.arc(node.x, node.y, node.val * 0.6, 0, 2 * Math.PI, false)
              ctx.fillStyle = node.color
              ctx.fill()
              
              // Draw Node Stroke
              if (isHovered || node.fx || selectedNode?.id === node.id || (node.group === 'Colony' && !node.expanded)) {
                ctx.lineWidth = ((node.fx || selectedNode?.id === node.id) ? 3 : 2) / globalScale
                ctx.strokeStyle = (node.group === 'Colony' && !node.expanded) ? '#10b981' : '#000'
                if (node.group === 'Colony' && !node.expanded) ctx.setLineDash([2, 2])
                ctx.stroke()
                ctx.setLineDash([])
              }

              // Fade out non-neighbors
              if (isFaded) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.85)' // white
                ctx.fill()
              }

              // Draw Emoji
              if (!isFaded) {
                const emojiSize = (node.val * 0.8)
                ctx.font = `${emojiSize}px Arial`
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                
                let emoji = '⚪'
                if (node.group === 'Volunteer') emoji = '👤'
                if (node.group === 'Colony') emoji = '🗺️'
                if (node.group === 'Cat') emoji = '🐈'
                if (node.group === 'Trap') emoji = '🪤'
                
                ctx.fillText(emoji, node.x, node.y + (emojiSize * 0.1))
              }

              // Text Label
              if (!isFaded && globalScale >= 1.5) {
                const textWidth = ctx.measureText(label).width
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2)
                
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)' // white
                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + (node.val * 0.6) + 2, bckgDimensions[0], bckgDimensions[1])
                ctx.fillStyle = '#111827' // gray-900
                ctx.fillText(label, node.x, node.y + (node.val * 0.6) + 2 + fontSize/2)
              }
            }}
            // Link Styling & Particles
            linkColor={link => (highlightLinks.size > 0 && !highlightLinks.has(link)) ? 'rgba(229,231,235, 0.5)' : link.color}
            linkWidth={link => (highlightLinks.size > 0 && highlightLinks.has(link)) ? 3 : 1.5}
            linkLineDash={link => link.dashed ? [2, 2] : null}
            linkDirectionalParticles={4}
            linkDirectionalParticleWidth={link => (highlightLinks.size === 0 || highlightLinks.has(link)) ? 2 : 0}
            linkDirectionalParticleSpeed={0.008}
            // Interaction
            onNodeHover={node => setHoverNode(node || null)}
            onNodeDragEnd={node => {
              setData(prev => ({
                ...prev,
                nodes: prev.nodes.map(n => n.id === node.id ? { ...n, fx: node.x, fy: node.y } : n)
              }))
            }}
            onNodeClick={node => {
              setSelectedNode(node)
              
              setData(prev => ({
                ...prev,
                nodes: prev.nodes.map(n => {
                  if (n.id === node.id) {
                    if (n.fx !== undefined && n.fx !== null) {
                      setSelectedNode(null)
                      return { ...n, fx: null, fy: null }
                    } else {
                      return { ...n, fx: n.x, fy: n.y }
                    }
                  }
                  return n
                })
              }))

              if ((node.fx === undefined || node.fx === null) && fgRef.current) {
                fgRef.current.centerAt(node.x, node.y, 1000)
                fgRef.current.zoom(8, 2000)
              }

              if (node.group === 'Colony' && !node.expanded) {
                expandColony(node)
              }
            }}
          />
        )}
      </div>
    </div>
  )
}
