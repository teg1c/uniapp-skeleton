const Tips = {
    isLoading: false,

    success(title, duration = 500) {
        setTimeout(() => {
            uni.showToast({
                title,
                icon: 'success',
                mask: true,
                duration
            });
        }, 300);
        if (duration > 0) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, duration);
            });
        }
    },

    /**
     * @return {Promise<any>}
     */
    showModal(content) {
        return new Promise(resolve => {
            uni.showModal({
                title: '提示',
                content,
                showCancel: false,
                success(res) {
                    if (res.confirm) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                },
                fail() {
                    resolve();
                }
            });
        });
    },

    /**
     * 弹出确认窗口
     */
    confirm(text, title = '提示') {
        return new Promise((resolve, reject) => {
            uni.showModal({
                title,
                content: text,
                showCancel: true,
                success: res => {
                    if (res.confirm) {
                        resolve(true);
                    } else if (res.cancel) {
                        resolve(false);
                    }
                },
                fail: res => {
                    reject(res);
                }
            });
        });
    },

    toast(title, onHide, icon = 'success', duration = 1500, mask = true) {
        setTimeout(() => {
            uni.showToast({
                title,
                icon,
                mask,
                duration
            });
        }, 300);

        // 隐藏结束回调
        if (onHide && typeof onHide === 'function') {
            setTimeout(() => {
                onHide();
            }, 1000);
        }
    },

    /**
     * 警告框
     */
    alert(title) {
        uni.showToast({
            title,
            mask: true,
            duration: 1500
        });
    },

    /**
     * 错误框
     */
    error(title, onHide) {
        uni.showToast({
            title,
            icon: 'none',
            mask: true,
            duration: 1500
        });
        // 隐藏结束回调
        if (onHide && typeof onHide === 'function') {
            setTimeout(() => {
                onHide();
            }, 1500);
        }
    },

    /**
     * 弹出加载提示
     */
    loading(title = '加载中') {
        if (Tips.isLoading) {
            return;
        }
        Tips.isLoading = true;
        uni.showLoading({
            title,
            mask: true
        });
    },

    /**
     * 加载完毕
     */
    loaded() {
        if (Tips.isLoading) {
            Tips.isLoading = false;
            setTimeout(() => {
                uni.hideLoading();
            }, 500);
        }
    }
};

export const tip = Tips;

export default Tips;
