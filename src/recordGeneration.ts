import {
  Channel,
  ChannelMetadata,
  Record,
  RecordMetadata,
  Scalar,
} from './app.types';

// TODO this needs to be somewhere else. Perhaps a setting?
export const resultsPerPage = 25;

export const generateRecordCollection = (): Record[] => {
  let records: Record[] = [];
  const random = randomNumber(resultsPerPage * 3, resultsPerPage * 10);

  for (let i = 0; i < random; i++) {
    records.push(generateRecord());
  }

  return records;
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

const generateChannels = (): any => {
  let returnedObject = {};
  const random = randomNumber(3, 6);

  for (let i = 0; i < random; i++) {
    const newChannel: Channel = {
      metadata: generateChannelMetadata(),
      data: randomNumber(100, 999),
    };
    const randomName = 'Channel_' + randomNumber(1000, 9999).toString();
    returnedObject = {
      ...returnedObject,
      [randomName]: newChannel,
    };
  }

  return returnedObject;
};

const generateChannelMetadata = (): ChannelMetadata => {
  return {
    dataType: generateScalar(),
  };
};

const generateScalar = (): Scalar => {
  return {
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
