using events from '../db/schema';

@path: 'service'
service EventService {
    entity Events as projection on events.Events;
    entity Participants as projection on events.Participants;

    action registerParticipant(eventId:Integer,participantId:Integer);
    action cancelEvent(eventId:Integer,reason:String);
    action reopenEvent(eventId:Integer);
    function getEventParticipants(eventId:Integer) returns array of Participants;
    function fetchParticipantsDetails(businessPartnerId:String) returns String;
}