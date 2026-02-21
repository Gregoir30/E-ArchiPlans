import { useEffect, useState } from 'react'
import { withAuthHeader } from '../utils/authToken'

function getValue(record, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), record)
}

function renderDetailValue(row, field) {
  const raw = getValue(row, field.key)
  if (field.format) return field.format(raw, row)
  return raw ?? '-'
}

export default function ModelViewPage({ title, description, resourcePath, columns, detailFields }) {
  const [status, setStatus] = useState('loading')
  const [rows, setRows] = useState([])
  const [message, setMessage] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setStatus('loading')
      setMessage('')

      try {
        const response = await fetch(resourcePath, {
          headers: withAuthHeader({ Accept: 'application/json' }),
        })

        if (response.status === 404) {
          if (!isMounted) return
          setStatus('empty')
          setRows([])
          setMessage("Endpoint API non disponible pour ce modele.")
          return
        }

        if (!response.ok) {
          if (!isMounted) return
          setStatus('error')
          setRows([])
          setMessage('Impossible de charger les donnees.')
          return
        }

        const data = await response.json().catch(() => null)
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
        if (!isMounted) return
        setRows(list)
        setSelectedRow(null)
        setStatus('success')
      } catch {
        if (!isMounted) return
        setStatus('error')
        setRows([])
        setMessage('Service indisponible.')
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [resourcePath])

  function handleView(row) {
    setSelectedRow(row)
    setMessage('')
  }

  function handleEdit(row) {
    setSelectedRow(row)
    setMessage("Action d'edition a brancher pour ce modele.")
  }

  function handleDelete(row) {
    setRows((prev) => prev.filter((item) => item.id !== row.id))
    if (selectedRow?.id === row.id) setSelectedRow(null)
    setMessage('Suppression locale effectuee (UI).')
  }

  return (
    <main className="page">
      <section className="section-intro">
        <p className="eyebrow">Modele</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>

      <section className="plans-section">
        {status === 'loading' ? <p>Chargement...</p> : null}
        {status === 'error' ? <p className="error">{message}</p> : null}
        {status === 'empty' ? <p>{message}</p> : null}
        {status === 'success' && message ? <p className="success">{message}</p> : null}

        {status === 'success' && rows.length === 0 ? <p>Aucune donnee.</p> : null}

        {status === 'success' && selectedRow ? (
          <article className="plan-card">
            <p className="plan-status">Selection</p>
            <h3>Detail</h3>
            <div className="detail-grid">
              {(detailFields?.length ? detailFields : columns).map((field) => (
                <div key={field.key} className="detail-item">
                  <p className="detail-label">{field.label}</p>
                  <p className="detail-value">{String(renderDetailValue(selectedRow, field))}</p>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        {status === 'success' && rows.length > 0 ? (
          <div className="table-wrap">
            <table className="model-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((column) => (
                      <td key={column.key}>{String(getValue(row, column.key) ?? '-')}</td>
                    ))}
                    <td>
                      <div className="table-actions">
                        <button type="button" className="secondary-btn" onClick={() => handleView(row)} title="Voir">
                          <i className="bi bi-eye" />
                        </button>
                        <button type="button" className="secondary-btn" onClick={() => handleEdit(row)} title="Editer">
                          <i className="bi bi-pencil" />
                        </button>
                        <button type="button" className="danger-btn" onClick={() => handleDelete(row)} title="Supprimer">
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  )
}
