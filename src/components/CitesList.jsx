import React from 'react'
import { Cite } from './Cite';

export const CitesList = ({cites}) => {
  return (
    <div>
        <ul className="list-group mt-2 mb-3">
        {cites.map((cite,index) =>(
            <Cite key={index} cite={cite}/>
        ))}
      </ul>
    </div>
  )
}
