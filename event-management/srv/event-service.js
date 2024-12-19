const cds = require('@sap/cds');

module.exports = cds.service.impl(async function(){
    const {Events,Participants} = this.entities;

    const BPService = await cds.connect.to('API_BUSINESS_PARTNER');
    async function validateBusinessPartner(businessPartnerId) {
        try {
            const result = await BPService.read('A_BusinessPartner')
                .where({ BusinessPartner: businessPartnerId });
            
            if (!result.length) {
                throw new Error(`Invalid BusinessPartnerID: ${businessPartnerId}`);
            }
            return result[0];
        } catch (error) {
            console.error('BP API Error:', error.message);
            throw new Error(`Invalid BusinessPartnerID: ${businessPartnerId}`);
        }
    }
    this.before('CREATE', 'Participants', async(req) => {
        const { BusinessPartnerID } = req.data;
        if (!BusinessPartnerID) {
            req.error(400, 'BusinessPartnerID is required');
            return;
        }
        await validateBusinessPartner(BusinessPartnerID);
    });
    

    this.on('registerParticipant',async(req) => {
        const {eventId,participantId} = req.data;
        try{
            const participant = await SELECT.one.from(Participants).where({ID:participantId});
            if(!participant) throw new Error('Participant not found');
    
            const event = await SELECT.from(Events).where({ID:eventId});
            if(!event) throw new Error('Event not found');
    
            if (participant.event_ID === eventId){
                return 'Participant already registered for this event';
            }
    
            await UPDATE(Participants)
                .set({ Event_ID: eventId })
                .where({ ID: participantId });
    
            return 'Participant registered successfully';

        }catch(error){
            console.error(error);
            throw new Error('Failed to register participant');
        }
    })

    this.on('cancelEvent',async(req) => {
        const {eventId,reason} = req.data;
        try{
            if (!eventId) {
                req.error(400, 'Event ID is required');
            }
            if (!reason) {
                req.error(400, 'Cancellation reason is required');
            }
            const event = await SELECT.one.from(Events).where({ID:eventId});
            if(!event) throw new Error('Event not found')
            
            await UPDATE(Events).set({
                IsCancelled:true,
                IsActive:false,
                CancellationReason:reason
            }).where({ID:eventId});
        return 'Event cancelled successfully'
        }catch(error){
            console.error(error);
            throw new Error('Failed to cancel event');
        }
    })

    this.on('reopenEvent',async(req) => {
        const {eventId} = req.data;
        try{
            const event = await SELECT.one.from(Events).where({ID:eventId});
            if(!event) throw new Error('Event not found');

            await UPDATE(Events).set({
                IsCancelled:false,
                IsActive:true,
                CancellationReason:null
            }).where({ID:eventId})
            return 'Event reopened successfully'
        }catch(error){
            console.error(error)
            throw new Error('Failed to reopen event')
        }
    })

    this.on('getEventParticipants',async(req) => {
        const {eventId} = req.data;

        try{
            const event = await SELECT.one.from(Events).where({ID:eventId});
            if(!event) throw new Error('Event not found');

            const participants = await SELECT.from(Participants).where({Event_ID:eventId});
            return participants;

        }catch(error){
            console.error(error);
            throw new Error('Failed to fetch event participants');
        }
    })
    this.on('fetchParticipantDetails', async(req) => {
        const {businessPartnerId} = req.data;
        if(!businessPartnerId) throw new Error('BusinessPartnerId is required');
        try {
            const result = await validateBusinessPartner(businessPartnerId);
            return result;
        } catch(error) {
            console.error('Error fetching from BP API:', error);
            throw new Error('Failed to fetch business partner details');
        }
    });


})