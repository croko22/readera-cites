import React from 'react'
import {MdSearch} from 'react-icons/md'
export const Search = ({handleSearchNote}) => {
  return (
    <div className="input-group rounded">
        <input onChange={(e)=>handleSearchNote(e.target.value)} className="form-control rounded" type="text" placeholder="Type to search quotes..." />
        <span className="input-group-text border-0">
        <MdSearch className="search-icons" size="1.3em"/>
        </span>
    </div>
 )
}