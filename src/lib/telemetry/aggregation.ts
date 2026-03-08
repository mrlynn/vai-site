export function buildModelRefsExpression() {
  return {
    $concatArrays: [
      {
        $cond: [
          { $and: [{ $ne: ['$model', null] }, { $ne: ['$model', ''] }] },
          [
            {
              model: '$model',
              role: { $ifNull: ['$modelRole', 'embedding'] },
              event: '$event',
              context: { $ifNull: ['$context', 'unknown'] },
              local: {
                $or: [
                  { $eq: ['$local', true] },
                  { $eq: ['$model', 'voyage-4-nano'] },
                ],
              },
            },
          ],
          [],
        ],
      },
      {
        $cond: [
          {
            $and: [
              { $ne: ['$embeddingModel', null] },
              { $ne: ['$embeddingModel', ''] },
              { $ne: ['$embeddingModel', '$model'] },
            ],
          },
          [
            {
              model: '$embeddingModel',
              role: 'embedding',
              event: '$event',
              context: { $ifNull: ['$context', 'unknown'] },
              local: {
                $or: [
                  { $eq: ['$local', true] },
                  { $eq: ['$embeddingModel', 'voyage-4-nano'] },
                ],
              },
            },
          ],
          [],
        ],
      },
      {
        $cond: [
          { $and: [{ $ne: ['$rerankModel', null] }, { $ne: ['$rerankModel', ''] }] },
          [
            {
              model: '$rerankModel',
              role: 'rerank',
              event: '$event',
              context: { $ifNull: ['$context', 'unknown'] },
              local: false,
            },
          ],
          [],
        ],
      },
      {
        $cond: [
          { $and: [{ $ne: ['$llmModel', null] }, { $ne: ['$llmModel', ''] }] },
          [
            {
              model: '$llmModel',
              role: 'llm',
              event: '$event',
              context: { $ifNull: ['$context', 'unknown'] },
              local: { $eq: ['$local', true] },
            },
          ],
          [],
        ],
      },
      {
        $cond: [
          { $and: [{ $ne: ['$queryModel', null] }, { $ne: ['$queryModel', ''] }] },
          [
            {
              model: '$queryModel',
              role: 'query',
              event: '$event',
              context: { $ifNull: ['$context', 'unknown'] },
              local: { $eq: ['$local', true] },
            },
          ],
          [],
        ],
      },
      {
        $cond: [
          { $and: [{ $ne: ['$docModel', null] }, { $ne: ['$docModel', ''] }] },
          [
            {
              model: '$docModel',
              role: 'document',
              event: '$event',
              context: { $ifNull: ['$context', 'unknown'] },
              local: { $eq: ['$local', true] },
            },
          ],
          [],
        ],
      },
    ],
  };
}
