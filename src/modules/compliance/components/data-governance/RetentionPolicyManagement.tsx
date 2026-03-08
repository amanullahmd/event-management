'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared-common/components/ui/card';
import { Badge } from '@/modules/shared-common/components/ui/badge';
import { Button } from '@/modules/shared-common/components/ui/button';
import { Input } from '@/modules/shared-common/components/ui/input';
import { Label } from '@/modules/shared-common/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/modules/shared-common/components/ui/table';
import { Alert, AlertDescription } from '@/modules/shared-common/components/ui/alert';
import { Shield, Plus, Trash2, Play, Edit } from 'lucide-react';
import type { RetentionPolicy, CreateRetentionPolicyRequest } from '@/lib/types/data-residency';

interface RetentionPolicyManagementProps {
  apiBaseUrl?: string;
}

export const RetentionPolicyManagement: React.FC<RetentionPolicyManagementProps> = ({ apiBaseUrl = '' }) => {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateRetentionPolicyRequest>({
    policyName: '', dataType: '', description: '', retentionDays: 30, action: 'ARCHIVE', legalBasis: '',
  });

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/data-governance/retention-policies`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch policies');
      const data: RetentionPolicy[] = await response.json();
      setPolicies(data);
      setError(null);
    } catch {
      setError('Unable to load retention policies.');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const handleCreate = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/data-governance/retention-policies`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to create policy');
      setShowForm(false);
      setFormData({ policyName: '', dataType: '', description: '', retentionDays: 30, action: 'ARCHIVE', legalBasis: '' });
      fetchPolicies();
    } catch {
      setError('Failed to create policy.');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await fetch(`${apiBaseUrl}/data-governance/retention-policies/${id}`, {
        method: 'DELETE', credentials: 'include',
      });
      fetchPolicies();
    } catch {
      setError('Failed to deactivate policy.');
    }
  };

  const handleExecute = async (id: string) => {
    try {
      await fetch(`${apiBaseUrl}/data-governance/retention-policies/${id}/execute`, {
        method: 'POST', credentials: 'include',
      });
      setError(null);
    } catch {
      setError('Failed to execute policy.');
    }
  };

  if (loading) {
    return <Card><CardContent className="py-8 text-center text-gray-500">Loading retention policies...</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="error"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <div>
                <CardTitle>Data Retention Policies</CardTitle>
                <CardDescription>Configure automated data retention and deletion rules.</CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)} size="sm">
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" /> Add Policy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6 p-4 border rounded-lg space-y-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="policyName">Policy Name</Label>
                  <Input id="policyName" value={formData.policyName} onChange={e => setFormData({...formData, policyName: e.target.value})} /></div>
                <div><Label htmlFor="dataType">Data Type</Label>
                  <Input id="dataType" value={formData.dataType} onChange={e => setFormData({...formData, dataType: e.target.value})} /></div>
                <div><Label htmlFor="retentionDays">Retention Days</Label>
                  <Input id="retentionDays" type="number" value={formData.retentionDays} onChange={e => setFormData({...formData, retentionDays: parseInt(e.target.value) || 1})} /></div>
                <div><Label htmlFor="action">Action</Label>
                  <div className="flex gap-2 mt-1">
                    <Button size="sm" variant={formData.action === 'ARCHIVE' ? 'default' : 'outline'} onClick={() => setFormData({...formData, action: 'ARCHIVE'})}>Archive</Button>
                    <Button size="sm" variant={formData.action === 'DELETE' ? 'default' : 'outline'} onClick={() => setFormData({...formData, action: 'DELETE'})}>Delete</Button>
                  </div>
                </div>
                <div><Label htmlFor="legalBasis">Legal Basis</Label>
                  <Input id="legalBasis" value={formData.legalBasis || ''} onChange={e => setFormData({...formData, legalBasis: e.target.value})} /></div>
                <div><Label htmlFor="description">Description</Label>
                  <Input id="description" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate}>Create Policy</Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Name</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Retention</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Legal Basis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map(policy => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.policyName}</TableCell>
                    <TableCell><Badge variant="outline">{policy.dataType}</Badge></TableCell>
                    <TableCell>{policy.retentionDays} days</TableCell>
                    <TableCell>
                      <Badge className={policy.action === 'DELETE' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                        {policy.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{policy.legalBasis || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleExecute(policy.id)} title="Execute now">
                          <Play className="h-3 w-3" aria-hidden="true" />
                        </Button>
                        {policy.isActive && (
                          <Button size="sm" variant="ghost" onClick={() => handleDeactivate(policy.id)} title="Deactivate">
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

