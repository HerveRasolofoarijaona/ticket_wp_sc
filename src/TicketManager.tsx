import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Textarea } from "./components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "./components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

declare global {
  interface Window {
    wrmData: {
      nonce: string;
      siteUrl: string;
      userId: number;
    };
  }
}

interface Ticket {
  id: number;
  title: string;
  status: 'open' | 'in-progress' | 'closed';
  description: string;
  userId?: number;
}

const TicketManager: React.FC = () => {
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'closed'>('all');
  const [newTicket, setNewTicket] = useState<Omit<Ticket, 'id'>>({ title: '', description: '', status: 'open' });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comment, setComment] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'user'>('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [allTickets, userTickets, filterStatus, activeTab]);

  const fetchTickets = async () => {
    try {
      const allTicketsResponse = await axios.get(`${window.wrmData.siteUrl}/wp-json/wrm/v1/tickets`, {
        headers: { 'X-WP-Nonce': window.wrmData.nonce }
      });
      setAllTickets(allTicketsResponse.data);

      const userTicketsResponse = await axios.get(`${window.wrmData.siteUrl}/wp-json/wrm/v1/tickets/user/${window.wrmData.userId}`, {
        headers: { 'X-WP-Nonce': window.wrmData.nonce }
      });
      setUserTickets(userTicketsResponse.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const filterTickets = () => {
    const ticketsToFilter = activeTab === 'all' ? allTickets : userTickets;
    if (filterStatus === 'all') {
      setFilteredTickets(ticketsToFilter);
    } else {
      setFilteredTickets(ticketsToFilter.filter(ticket => ticket.status === filterStatus));
    }
  };

  const handleCreateTicket = async () => {
    try {
      const response = await axios.post(`${window.wrmData.siteUrl}/wp-json/wrm/v1/tickets`, newTicket, {
        headers: { 'X-WP-Nonce': window.wrmData.nonce }
      });
      setAllTickets([...allTickets, response.data]);
      setUserTickets([...userTickets, response.data]);
      setNewTicket({ title: '', description: '', status: 'open' });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'open' | 'in-progress' | 'closed') => {
    try {
      const response = await axios.put(`${window.wrmData.siteUrl}/wp-json/wrm/v1/tickets/${id}`, { status: newStatus }, {
        headers: { 'X-WP-Nonce': window.wrmData.nonce }
      });
      setAllTickets(allTickets.map(ticket => ticket.id === id ? response.data : ticket));
      setUserTickets(userTickets.map(ticket => ticket.id === id ? response.data : ticket));
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket) return;
    try {
      await axios.post(`${window.wrmData.siteUrl}/wp-json/wrm/v1/tickets/${selectedTicket.id}/comments`, { comment }, {
        headers: { 'X-WP-Nonce': window.wrmData.nonce }
      });
      setComment('');
      // In a real app, you'd update the ticket with the new comment
      console.log(`Comment added to ticket ${selectedTicket.id}: ${comment}`);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Ticket Manager</h1>
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="all">All Tickets</TabsTrigger>
          <TabsTrigger value="user">My Tickets</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="flex justify-between items-center mb-6">
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>Create New Ticket</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Ticket</DialogTitle>
                  <DialogDescription>Fill in the details for your new ticket.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input
                      id="title"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Textarea
                      id="description"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select
                      value={newTicket.status}
                      onValueChange={(value: any) => setNewTicket({ ...newTicket, status: value })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateTicket}>Create Ticket</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
        <TabsContent value="user">
          <div className="flex justify-between items-center mb-6">
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
      <div className="grid gap-6">
        {filteredTickets.map(ticket => (
          <Card key={ticket.id}>
            <CardHeader>
              <CardTitle>{ticket.title}</CardTitle>
              <CardDescription>Status: {ticket.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{ticket.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Select
                value={ticket.status}
                onValueChange={(value: any) => handleStatusChange(ticket.id, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setSelectedTicket(ticket)}>View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTicket.title}</DialogTitle>
              <DialogDescription>Status: {selectedTicket.status}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p>{selectedTicket.description}</p>
              <Textarea
                placeholder="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button onClick={handleAddComment}>Add Comment</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TicketManager;