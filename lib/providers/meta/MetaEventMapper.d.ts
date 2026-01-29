import { Event, EventType } from '../../models/Event';
export interface MetaMappedEvent {
    eventName: string;
    parameters: Record<string, any>;
}
export declare class MetaEventMapper {
    private eventNameMap;
    private parameterMap;
    mapEvent(event: Event): MetaMappedEvent;
    private mapEventName;
    private mapParameters;
    shouldSendEvent(_event: Event): boolean;
    getStandardEventName(eventType: EventType): string | undefined;
}
//# sourceMappingURL=MetaEventMapper.d.ts.map