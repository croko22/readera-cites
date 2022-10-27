import React from 'react'
import { Link } from 'react-router-dom'
export const BookCard = ({libro}) => {
  return (
    <Link to="/book" state={libro} className="list-group-item list-group-item-action flex-column align-items-start">
        <div className="d-flex w-100 justify-content-between">
        <h5 className="mb-1">{libro.data.doc_file_name_title} {libro.data.doc_favorites_time!==0 && <span className="btn btn-warning">Fav</span>}</h5>
        <small>{libro.citations.length} quotes</small>
        </div>
    </Link>
  )
}
