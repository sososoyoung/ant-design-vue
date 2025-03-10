import { inject, cloneVNode, defineComponent } from 'vue';
import CloseOutlined from '@ant-design/icons-vue/CloseOutlined';
import CheckCircleOutlined from '@ant-design/icons-vue/CheckCircleOutlined';
import ExclamationCircleOutlined from '@ant-design/icons-vue/ExclamationCircleOutlined';
import InfoCircleOutlined from '@ant-design/icons-vue/InfoCircleOutlined';
import CloseCircleOutlined from '@ant-design/icons-vue/CloseCircleOutlined';
import CheckCircleFilled from '@ant-design/icons-vue/CheckCircleFilled';
import ExclamationCircleFilled from '@ant-design/icons-vue/ExclamationCircleFilled';
import InfoCircleFilled from '@ant-design/icons-vue/InfoCircleFilled';
import CloseCircleFilled from '@ant-design/icons-vue/CloseCircleFilled';
import classNames from '../_util/classNames';
import BaseMixin from '../_util/BaseMixin';
import PropTypes from '../_util/vue-types';
import { getTransitionProps, Transition } from '../_util/transition';
import { getComponent, isValidElement, findDOMNode } from '../_util/props-util';
import { defaultConfigProvider } from '../config-provider';
import { tuple, withInstall } from '../_util/type';

function noop() {}

const iconMapFilled = {
  success: CheckCircleFilled,
  info: InfoCircleFilled,
  error: CloseCircleFilled,
  warning: ExclamationCircleFilled,
};

const iconMapOutlined = {
  success: CheckCircleOutlined,
  info: InfoCircleOutlined,
  error: CloseCircleOutlined,
  warning: ExclamationCircleOutlined,
};

export const AlertProps = {
  /**
   * Type of Alert styles, options: `success`, `info`, `warning`, `error`
   */
  type: PropTypes.oneOf(tuple('success', 'info', 'warning', 'error')),
  /** Whether Alert can be closed */
  closable: PropTypes.looseBool,
  /** Close text to show */
  closeText: PropTypes.VNodeChild,
  /** Content of Alert */
  message: PropTypes.VNodeChild,
  /** Additional content of Alert */
  description: PropTypes.VNodeChild,
  /** Callback when close Alert */
  // onClose?: React.MouseEventHandler<HTMLAnchorElement>;
  /** Trigger when animation ending of Alert */
  afterClose: PropTypes.func.def(noop),
  /** Whether to show icon */
  showIcon: PropTypes.looseBool,
  prefixCls: PropTypes.string,
  banner: PropTypes.looseBool,
  icon: PropTypes.VNodeChild,
  onClose: PropTypes.VNodeChild,
};

const Alert = defineComponent({
  name: 'AAlert',
  mixins: [BaseMixin],
  inheritAttrs: false,
  props: AlertProps,
  emits: ['close'],
  setup() {
    return {
      configProvider: inject('configProvider', defaultConfigProvider),
    };
  },
  data() {
    return {
      closing: false,
      closed: false,
    };
  },
  methods: {
    handleClose(e: Event) {
      e.preventDefault();
      const dom = findDOMNode(this);
      dom.style.height = `${dom.offsetHeight}px`;
      // Magic code
      // 重复一次后才能正确设置 height
      dom.style.height = `${dom.offsetHeight}px`;

      this.setState({
        closing: true,
      });
      this.$emit('close', e);
    },
    animationEnd() {
      this.setState({
        closing: false,
        closed: true,
      });
      this.afterClose();
    },
  },

  render() {
    const { prefixCls: customizePrefixCls, banner, closing, closed, $attrs } = this;
    const { getPrefixCls } = this.configProvider;
    const prefixCls = getPrefixCls('alert', customizePrefixCls);

    let { closable, type, showIcon } = this;
    const closeText = getComponent(this, 'closeText');
    const description = getComponent(this, 'description');
    const message = getComponent(this, 'message');
    const icon = getComponent(this, 'icon');
    // banner模式默认有 Icon
    showIcon = banner && showIcon === undefined ? true : showIcon;
    // banner模式默认为警告
    type = banner && type === undefined ? 'warning' : type || 'info';

    const IconType = (description ? iconMapOutlined : iconMapFilled)[type] || null;

    // closeable when closeText is assigned
    if (closeText) {
      closable = true;
    }

    const alertCls = classNames(prefixCls, {
      [`${prefixCls}-${type}`]: true,
      [`${prefixCls}-closing`]: closing,
      [`${prefixCls}-with-description`]: !!description,
      [`${prefixCls}-no-icon`]: !showIcon,
      [`${prefixCls}-banner`]: !!banner,
      [`${prefixCls}-closable`]: closable,
    });

    const closeIcon = closable ? (
      <a type="button" onClick={this.handleClose} class={`${prefixCls}-close-icon`} tabindex={0}>
        {closeText ? <span class={`${prefixCls}-close-text`}>{closeText}</span> : <CloseOutlined />}
      </a>
    ) : null;

    const iconNode = (icon &&
      (isValidElement(icon) ? (
        cloneVNode(icon, {
          class: `${prefixCls}-icon`,
        })
      ) : (
        <span class={`${prefixCls}-icon`}>{icon}</span>
      ))) || <IconType class={`${prefixCls}-icon`} />;
    // h(iconType, { class: `${prefixCls}-icon` });

    const transitionProps = getTransitionProps(`${prefixCls}-slide-up`, {
      appear: false,
      onAfterLeave: this.animationEnd,
    });
    return closed ? null : (
      <Transition {...transitionProps}>
        <div {...$attrs} v-show={!closing} class={[$attrs.class, alertCls]} data-show={!closing}>
          {showIcon ? iconNode : null}
          <span class={`${prefixCls}-message`}>{message}</span>
          <span class={`${prefixCls}-description`}>{description}</span>
          {closeIcon}
        </div>
      </Transition>
    );
  },
});

export default withInstall(Alert);
