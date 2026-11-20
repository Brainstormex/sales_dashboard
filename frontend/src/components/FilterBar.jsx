import React from 'react';
import { Filter, RotateCcw, Calendar, Tag, Activity, Users, MapPin } from 'lucide-react';

export default function FilterBar({
  filterOptions,
  selectedFilters,
  onChange,
  onReset
}) {
  const handleSelectChange = (key, value) => {
    onChange({ ...selectedFilters, [key]: value });
  };

  const isFiltered = (
    selectedFilters.startDate ||
    selectedFilters.endDate ||
    selectedFilters.category ||
    selectedFilters.orderStatus ||
    selectedFilters.customerSegment ||
    selectedFilters.city
  );

  return (
    <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.85rem',
        paddingBottom: '0.65rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontWeight: 700, fontSize: '0.88rem' }}>
          <Filter size={16} color="#d97706" />
          <span>Multi-Dimensional Filters</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 400 }}>
            (Live SQL parameterized queries)
          </span>
        </div>

        {isFiltered && (
          <button
            onClick={onReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'transparent',
              border: '1px solid #334466',
              color: '#94a3b8',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.borderColor = '#475569'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334466'; }}
          >
            <RotateCcw size={12} />
            Reset Filters
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.85rem'
      }}>
        {/* Start Date */}
        <div>
          <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={13} color="#ffffff" strokeWidth={2.2} /> 
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Start Date</span>
          </label>
          <input
            type="date"
            className="form-input"
            value={selectedFilters.startDate || ''}
            min={filterOptions.min_date || ''}
            max={selectedFilters.endDate || filterOptions.max_date || ''}
            onChange={(e) => handleSelectChange('startDate', e.target.value)}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={13} color="#ffffff" strokeWidth={2.2} /> 
            <span style={{ color: '#ffffff', fontWeight: 700 }}>End Date</span>
          </label>
          <input
            type="date"
            className="form-input"
            value={selectedFilters.endDate || ''}
            min={selectedFilters.startDate || filterOptions.min_date || ''}
            max={filterOptions.max_date || ''}
            onChange={(e) => handleSelectChange('endDate', e.target.value)}
          />
        </div>

        {/* Product Category */}
        <div>
          <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Tag size={12} /> Category
          </label>
          <select
            className="form-select"
            value={selectedFilters.category || ''}
            onChange={(e) => handleSelectChange('category', e.target.value)}
          >
            <option value="">All Categories ({filterOptions.categories?.length || 0})</option>
            {filterOptions.categories?.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Order Status */}
        <div>
          <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Activity size={12} /> Order Status
          </label>
          <select
            className="form-select"
            value={selectedFilters.orderStatus || ''}
            onChange={(e) => handleSelectChange('orderStatus', e.target.value)}
          >
            <option value="">All Statuses</option>
            {filterOptions.order_statuses?.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Customer Segment */}
        <div>
          <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Users size={12} /> Segment
          </label>
          <select
            className="form-select"
            value={selectedFilters.customerSegment || ''}
            onChange={(e) => handleSelectChange('customerSegment', e.target.value)}
          >
            <option value="">All Segments ({filterOptions.customer_segments?.length || 0})</option>
            {filterOptions.customer_segments?.map((seg) => (
              <option key={seg} value={seg}>{seg}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={12} /> City
          </label>
          <select
            className="form-select"
            value={selectedFilters.city || ''}
            onChange={(e) => handleSelectChange('city', e.target.value)}
          >
            <option value="">All Cities ({filterOptions.cities?.length || 0})</option>
            {filterOptions.cities?.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
