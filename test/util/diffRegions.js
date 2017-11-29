import test     from 'ava';
import diffRegions from '../../src/util/diffRegions';

test('diffRegions', t => {
  // Both empty
  t.deepEqual(diffRegions([ ],
                          [ ]),
                          [ ]);

  // A Empty
  t.deepEqual(diffRegions([ ],
                          [ 'aaa', 'aab', 'aac', 'aad' ]),
                          [ ]);

  // B empty
  t.deepEqual(diffRegions([ 'aaa', 'aab', 'aac', 'aad' ],
                          [ ]),
                          [ 'aaa', 'aab', 'aac', 'aad' ]);

  // Disjoint, alphabetically all A follows all B
  t.deepEqual(diffRegions([ 'zza', 'zzb', 'zzc', 'zzd' ],
                          [ 'aaa', 'aab', 'aac', 'aad' ]),
                          [ 'zza', 'zzb', 'zzc', 'zzd' ]);

  // Disjoint, alphabetically all A preceeds all B
  t.deepEqual(diffRegions([ 'aaa', 'aab', 'aac', 'aad' ],
                          [ 'zza', 'zzb', 'zzc', 'zzd' ]),
                          [ 'aaa', 'aab', 'aac', 'aad' ]);

  // Disjoint, alphabetically interleaved, A[n] preceeds B[n]
  t.deepEqual(diffRegions([ 'aaa', 'aac', 'aae', 'aag' ],
                          [ 'aab', 'aad', 'aaf', 'aah' ]),
                          [ 'aaa', 'aac', 'aae', 'aag' ]);

  // Disjoint, alphabetically interleaved, B[n] preceeds A[n]
  t.deepEqual(diffRegions([ 'aab', 'aad', 'aaf', 'aah' ],
                          [ 'aaa', 'aac', 'aae', 'aag' ]),
                          [ 'aab', 'aad', 'aaf', 'aah' ]);

  // Intersecting, A shorter
  t.deepEqual(diffRegions([ 'aab', 'aac' ],
                          [ 'aaa', 'aab', 'aac', 'aad' ]),
                          [ ]);

  // Intersecting, B shorter
  t.deepEqual(diffRegions([ 'aaa', 'aab', 'aac', 'aad' ],
                          [ 'aab', 'aac' ]),
                          [ 'aaa', 'aad' ]);

  // Intersecting, same length
  t.deepEqual(diffRegions([ 'aaa', 'aab', 'aac', 'aad' ],
                          [ 'aab', 'aac', 'zza', 'zzb' ]),
                          [ 'aaa', 'aad' ]);

  // Fully overlaping
  t.deepEqual(diffRegions([ 'aaa', 'aab', 'aac', 'aad' ],
                          [ 'aaa', 'aab', 'aac', 'aad' ]),
                          [ ]);
});

