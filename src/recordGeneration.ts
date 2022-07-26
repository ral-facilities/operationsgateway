import {
  Channel,
  Record,
  RecordMetadata,
  ScalarMetadata,
  ChannelMetadata,
  FullChannelMetadata,
  DataType,
  ScalarChannel,
} from './app.types';

// TODO this needs to be somewhere else. Perhaps a setting?
export const resultsPerPage = 25;

let channelMetadata: FullChannelMetadata[] = [];

export const generateRecordCollection = (): Record[] => {
  channelMetadata = [];

  let records: Record[] = [];
  const random = randomNumber(resultsPerPage * 3, resultsPerPage * 10);

  for (let i = 0; i < random; i++) {
    records.push(generateRecord());
  }

  return records;
};

export const getFullChannelMetadata = () => channelMetadata;

const generateFullChannelMetadata = (
  channelName: string,
  dataType: DataType
): FullChannelMetadata => {
  const channelMetadata: FullChannelMetadata = {
    systemName: channelName,
    dataType: dataType,
    userFriendlyName: channelName.slice(0, 7) + ' ' + channelName.slice(7),
    description: `${channelName} description`,
    units: `${channelName} units`,
  };
  if (channelMetadata.dataType === 'scalar') {
    channelMetadata.significantFigures = randomNumber(1, 5);
    channelMetadata.scientificNotation = Math.random() < 0.5;
  }
  return channelMetadata;
};

const generateRecord = (): Record => {
  return {
    id: randomNumber(100, 999).toString(),
    metadata: generateRecordMetadata(),
    channels: generateChannels(),
  };
};

const generateRecordMetadata = (): RecordMetadata => {
  return {
    dataVersion: randomNumber(100, 999).toString(),
    shotNum: randomNumber(100, 999),
    timestamp: randomDate().getTime().toString(),
    activeArea: randomNumber(100, 999).toString(),
    activeExperiment: randomNumber(100, 999).toString(),
  };
};

const generateChannels = (): Channel[] => {
  let channels: Channel[] = [];
  const random = randomNumber(3, 6);

  for (let i = 0; i < random; i++) {
    const randomName = 'Channel' + randomNumber(1000, 9999).toString();
    const newChannel: ScalarChannel = {
      name: randomName,
      metadata: generateChannelMetadata(),
      data: randomNumber(1000, 9999) / 10,
    };
    
    channelMetadata.push(
      generateFullChannelMetadata(randomName, newChannel.metadata.dataType)
    );

    channels.push(newChannel);
  }

  return channels;
};

const generateChannelMetadata = (): ChannelMetadata => {
  return generateScalar();
};

const generateScalar = (): ScalarMetadata => {
  return {
    dataType: 'scalar',
    units: 'km',
  };
};

const randomDate = (): Date => {
  const start = new Date(2024, 0, 1);
  const end = new Date(2026, 11, 31);

  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

export const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
