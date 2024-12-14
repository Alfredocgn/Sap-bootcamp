
namespace events;

entity Events {
    key ID: Integer;
    Name: String(100);
    StartDate: Date;
    EndDate: Date;
    Location: String(200);
    Description: String(500);
    IsActive: Boolean default true;
    IsCancelled: Boolean default false;
    CancellationReason: String(500);
    participants: Association to many Participants on participants.Event = $self;
}

entity Participants {
    key ID: Integer;
    FirstName: String(50);
    LastName: String(50);
    Email: String(100);
    Phone: String(20);
    BusinessPartnerID:String(50);
    Event: Association to one Events;
}