import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const DashboardStats: React.FC = async () => {
  let pendingCount = 0
  let totalCount = 0
  let processingCount = 0
  let completedCount = 0

  try {
    const payload = await getPayload({ config })
    
    // Fetch counts
    const pendingOrders = await payload.find({
      collection: 'orders',
      where: {
        status: {
          equals: 'pending',
        },
      },
      limit: 0, // limit 0 gets count without returning documents
    })
    pendingCount = pendingOrders.totalDocs || 0

    const totalOrders = await payload.find({
      collection: 'orders',
      limit: 0,
    })
    totalCount = totalOrders.totalDocs || 0

    const processingOrders = await payload.find({
      collection: 'orders',
      where: {
        status: {
          equals: 'processing',
        },
      },
      limit: 0,
    })
    processingCount = processingOrders.totalDocs || 0

    const completedOrders = await payload.find({
      collection: 'orders',
      where: {
        status: {
          equals: 'completed',
        },
      },
      limit: 0,
    })
    completedCount = completedOrders.totalDocs || 0
  } catch (err) {
    console.error('Failed to load dashboard stats:', err)
  }

  return (
    <div style={{
      marginBottom: '32px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <h2 style={{
        margin: '0 0 16px 0',
        fontSize: '24px',
        fontWeight: '700',
        color: 'var(--theme-elevation-800, #1e293b)'
      }}>
        Paneli i Porosive (Orders Dashboard)
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
      }}>
        {/* Pending Orders Card */}
        <div style={{
          background: pendingCount > 0 
            ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0.05) 100%)' 
            : 'var(--theme-elevation-50, #f8fafc)',
          border: pendingCount > 0 
            ? '1.5px solid #eab308' 
            : '1px solid var(--theme-elevation-150, #e2e8f0)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: pendingCount > 0 ? '0 4px 12px rgba(234, 179, 8, 0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Porosi të Reja (Pending)
            </div>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: '900', 
              color: pendingCount > 0 ? '#eab308' : 'var(--theme-elevation-900, #0f172a)',
              marginTop: '4px'
            }}>
              {pendingCount}
            </div>
          </div>
          {pendingCount > 0 && (
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#eab308',
              borderRadius: '50%',
              position: 'absolute',
              top: '12px',
              right: '12px',
              boxShadow: '0 0 10px #eab308',
              animation: 'pulse 2s infinite'
            }} />
          )}
        </div>

        {/* Processing Orders Card */}
        <div style={{
          background: 'var(--theme-elevation-50, #f8fafc)',
          border: '1px solid var(--theme-elevation-150, #e2e8f0)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Në Procesim (Processing)
            </div>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: '900', 
              color: 'var(--theme-elevation-900, #0f172a)',
              marginTop: '4px'
            }}>
              {processingCount}
            </div>
          </div>
        </div>

        {/* Completed Orders Card */}
        <div style={{
          background: 'var(--theme-elevation-50, #f8fafc)',
          border: '1px solid var(--theme-elevation-150, #e2e8f0)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Të Përfunduara (Completed)
            </div>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: '900', 
              color: 'var(--theme-elevation-900, #0f172a)',
              marginTop: '4px'
            }}>
              {completedCount}
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div style={{
          background: 'var(--theme-elevation-50, #f8fafc)',
          border: '1px solid var(--theme-elevation-150, #e2e8f0)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--theme-elevation-500, #64748b)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Totali i Porosive (Total)
            </div>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: '900', 
              color: 'var(--theme-elevation-900, #0f172a)',
              marginTop: '4px'
            }}>
              {totalCount}
            </div>
          </div>
        </div>
      </div>
      
      {/* Styles for pulse animation if pendingCount > 0 */}
      {pendingCount > 0 && (
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.15); opacity: 1; box-shadow: 0 0 14px #eab308; }
            100% { transform: scale(0.95); opacity: 0.8; }
          }
        `}} />
      )}
    </div>
  )
}
