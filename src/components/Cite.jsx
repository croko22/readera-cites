import React from 'react'
import { FaCopy } from "react-icons/fa";
export const Cite = ({cite}) => {
    const colors = ['list-group-item-secondary','list-group-item-danger','list-group-item-warning','list-group-item-success','list-group-item-primary']
  
    const copyCite = (text)=>{
        navigator.clipboard.writeText(text);
    };
  
    return (
    <div>
        <li className={`list-group-item ${colors[cite.note_mark]}`}>
            <div className="d-flex justify-content-between align-items-center">
                <h5>Pagina: {cite.note_page}</h5>
                <FaCopy style={{cursor:'pointer'}} onClick={() => copyCite(cite.note_body)}/>
            </div>
            <p className="mb-1">{cite.note_body}</p>
            <small >{(cite.note_extra)?`Nota: ${cite.note_extra}`:""}</small>
        </li>
    </div>
  )
}
