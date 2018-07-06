import { trigger, transition, query, style, stagger, animate, group } from '@angular/animations';

export const staggerTodos = trigger('staggerTodos', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({ opacity: 0, height: 0 }),
        stagger('70ms', animate('100ms ease-out', style({ height: '*' }))),
        animate('150ms ease-in-out', style({ opacity: 1 }))
      ],
      { optional: true }
    ),
    group([
      query(':leave .view', [style({ opacity: 1 }), animate('20ms ease-in-out', style({ opacity: 0 }))], {
        optional: true
      }),
      query(
        ':leave',
        [
          style({ height: '*', opacity: 1 }),
          group(
            [
              animate('50ms ease-in-out', style({ opacity: 0 })),
              stagger('100ms', animate('200ms ease-out', style({ height: 0 })))
            ],
            { delay: '70ms' }
          )
        ],
        {
          optional: true
        }
      )
    ])
  ])
]);
