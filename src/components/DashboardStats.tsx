'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { TranslatedText } from '@/components/TranslatedText';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '@/contexts/AppContext';

interface FiscalYearStats {
  fiscalYear: string;
  fileCount: number;
  folderCount: number;
}

interface GrantTypeStats {
  name: string;
  value: number;
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DashboardStats() {
  const { language } = useApp();
  const [fiscalYearStats, setFiscalYearStats] = useState<FiscalYearStats[]>([]);
  const [grantTypeStats, setGrantTypeStats] = useState<GrantTypeStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [fiscalYearRes, grantTypeRes] = await Promise.all([
          fetch('/api/stats/fiscal-year'),
          fetch('/api/stats/grant-type')
        ]);

        const fiscalYearData = await fiscalYearRes.json();
        const grantTypeData = await grantTypeRes.json();

        setFiscalYearStats(fiscalYearData);
        setGrantTypeStats(grantTypeData);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-dark-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-dark-700 rounded"></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-dark-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-dark-700 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Fiscal Year Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-dark-100 mb-4">
          <TranslatedText text="dashboard.stats.fiscalYearSummary" />
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={fiscalYearStats}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="fiscalYear" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.375rem',
                  color: '#F3F4F6'
                }}
              />
              <Legend />
              <Bar dataKey="fileCount" name="Files" fill="#3B82F6" />
              <Bar dataKey="folderCount" name="Folders" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Grant Type Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-dark-100 mb-4">
          <TranslatedText text="dashboard.stats.grantTypeStats" />
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={grantTypeStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1000}
                animationBegin={0}
                animationEasing="ease-out"
              >
                {grantTypeStats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="#1F2937"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.375rem',
                  color: '#F3F4F6'
                }}
                formatter={(value: number, name: string) => [
                  `${value} files`,
                  name
                ]}
              />
              <Legend 
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{
                  paddingLeft: '20px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
} 