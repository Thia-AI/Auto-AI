import React, { useEffect, useState } from 'react';

import { Box, HStack, Progress, Spacer, Text, useColorModeValue as mode } from '@chakra-ui/react';
import { connect } from 'react-redux';
import { Job, nullJob } from '../../helpers/constants/engineTypes';
import { EngineRequestHandler } from '_/renderer/engine-requests/engineRequestHandler';

interface Props {
	jobID?: string;
	onJobFinished: () => void;
	initialJob: Job;
}

const JobProgressC = React.memo((props: Props) => {
	const { jobID, onJobFinished, initialJob } = props;

	const intervalTime = 750;
	const [intervalID, setIntervalID] = useState<number>();
	const [job, setJob] = useState<Job>(nullJob);
	const bg = mode('thia.gray.100', 'thia.gray.750');
	const borderColor = mode('thia.gray.150', 'thia.gray.700');
	const jobNameColor = mode('thia.gray.600', 'thia.gray.350');
	const jobProgressColor = mode('thia.gray.700', 'thia.gray.300');
	// We set here so that it displays the proper job name and progress
	// even before the first setInterval() has ran below
	useEffect(() => {
		setJob(initialJob);
	}, []);

	useEffect(() => {
		// Clear interval if jobID doesn't exist (when it finishes or hasn't started).
		// Or start function running every interval time that updates job status
		if (!jobID) {
			setJob(nullJob);
			clearInterval(intervalID);
		} else {
			setIntervalID(
				window.setInterval(async () => {
					const [err, resData] = await EngineRequestHandler.getInstance().getJob(jobID, {
						timeout: intervalTime - 100,
					});

					if (!err) {
						const resDataJob = resData as Job;
						if (resDataJob.has_finished) {
							onJobFinished();
							return;
						}
						setJob(resDataJob);
					}
				}, intervalTime),
			);
		}
	}, [jobID]);

	const render = () => {
		if (!jobID) return <></>;
		else
			return (
				<Box
					w='full'
					rounded='md'
					bg={bg}
					marginBottom='3'
					px='4'
					py='2'
					borderWidth='1px'
					borderColor={borderColor}>
					<HStack w='full'>
						<Text fontSize='sm' color={jobProgressColor} as='h6'>
							{job.job_name}
						</Text>
						<Spacer />
						<Text fontSize='sm' color={jobNameColor} as='p' pr='2'>
							{job.progress}/{job.progress_max - 1}
						</Text>
					</HStack>
					<Progress
						transition='all 250ms ease'
						borderRadius='sm'
						my='2'
						w='full'
						min={0}
						max={job.progress_max - 1}
						value={job.progress}
						size='sm'
					/>
				</Box>
			);
	};
	return render();
});

JobProgressC.displayName = 'JobProgress';

/**
 * Component that auto-monitors a Job ID and updates it's UI slider
 */
export const JobProgress = connect()(JobProgressC);
